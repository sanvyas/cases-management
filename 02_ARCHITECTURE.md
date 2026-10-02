# 02 — Architecture: Samadhan

## 1. Architectural style and why
- **Modular monolith** (NestJS) with strict module boundaries, plus three separately deployable processes: `worker`, `voice-gateway` and the web/mobile frontends. Government customers need simple, self-hostable deployments; a modular monolith deploys as a few containers yet keeps domains isolated enough to split later.
- **Pure domain core:** business rules live in `packages/domain` (no framework, no I/O), unit-tested to ≥ 90%.
- **Event-driven side effects:** state changes write domain events to a **transactional outbox**; the worker relays them to BullMQ queues for notifications, integrations, analytics rollups and webhooks.
- **Portable:** runs on any Kubernetes (managed or on-prem) or on a single VM with Docker Compose. No proprietary BaaS dependency, because MeitY-empanelled clouds and state data centres must be supported.

## 2. Technology stack
| Concern | Choice |
|---|---|
| Language | TypeScript (strict) everywhere; Node.js 22 LTS |
| Monorepo | pnpm workspaces + Turborepo |
| API | NestJS, Zod validation (nestjs-zod), OpenAPI generated, REST + Server-Sent Events/WebSocket for realtime |
| DB | PostgreSQL 16 with RLS, PostGIS, pg_trgm, ltree; Drizzle ORM + raw SQL for RLS and complex queries |
| Cache/queues | Redis 7; BullMQ (queues, repeatable jobs, rate-limited queues per provider) |
| Object storage | S3-compatible (AWS S3 / MinIO); presigned URLs; lifecycle rules per retention class |
| Search | Postgres full-text + trigram; optional OpenSearch later (ADR) |
| Web | React 18 + Vite, TanStack Router + Query, Tailwind, Radix/shadcn-based `packages/ui`, react-i18next, Leaflet + OSM (Mappls adapter), ECharts/Recharts |
| PWA | Workbox service worker, IndexedDB (Dexie) offline queue |
| Mobile | Expo (React Native), expo-router, SQLite (op-sqlite or WatermelonDB) for offline, expo-camera, expo-location, background sync, FCM push; app variants: `staff`, `citizen` |
| Voice gateway | Node WebSocket service for telephony media streams (Exotel/Plivo/Twilio-style bidirectional audio); VAD; streaming STT/TTS |
| AI | Provider adapters: STT/TTS (Sarvam default; Bhashini and Google alternates), LLM (configurable: Sarvam, Claude, Gemini, GPT); image (perceptual hash in-house; vision LLM for advisory assessment) |
| BI | Metabase (embedded, signed embedding) on a read-replica reporting schema |
| Auth | In-house auth module: phone OTP, TOTP 2FA, optional password for staff, OIDC/SAML SSO (`sso`), JWT access (15 min) + rotating refresh tokens, device sessions |
| Observability | OpenTelemetry (traces, metrics, logs) → Prometheus + Grafana + Loki + Tempo; Sentry-compatible error tracking (GlitchTip self-host option) |
| Security scanning | Semgrep, Trivy, gitleaks, pnpm audit, OWASP ZAP baseline, CycloneDX SBOM |
| CI/CD | GitHub Actions (or GitLab CI equivalent); container registry; Helm release; Argo CD optional |
| IaC | Helm chart; Terraform modules (optional) for AWS ap-south-1 and a generic VM target |

## 3. Runtime topology
```
             ┌──────────────┐   ┌──────────────┐   ┌───────────────┐
 Citizens ──▶│ web-citizen  │   │  web-staff   │   │ mobile (Expo) │
             └──────┬───────┘   └──────┬───────┘   └──────┬────────┘
                    │ HTTPS (WAF / Ingress / rate limit)  │
                    ▼                                     ▼
             ┌────────────────────────────────────────────────────┐
 Webhooks ──▶│ api (NestJS) — REST, webhooks, SSE/WS, auth, RLS   │
 (WhatsApp,  └───────┬───────────────┬──────────────┬─────────────┘
  SMS, social,       │ SQL (RLS)     │ outbox       │ presigned URLs
  telephony)         ▼               ▼              ▼
             ┌──────────────┐  ┌──────────┐   ┌──────────────┐
             │ PostgreSQL   │  │  Redis   │   │ S3 / MinIO   │
             │ primary+rep. │  │ BullMQ   │   └──────────────┘
             └──────┬───────┘  └────┬─────┘
                    │               ▼
                    │        ┌─────────────┐      ┌────────────────┐
                    └───────▶│   worker    │─────▶│ Provider APIs  │
                             │ schedulers, │      │ STT/TTS/LLM/WA │
                             │ outbox relay│      │ SMS/e-mail/... │
                             └─────────────┘      └────────────────┘
 Phone calls ─▶ Telephony ─▶ voice-gateway (WS media) ─▶ api (intake engine)
 Metabase ─▶ read replica (reporting schema)
```

## 4. Multi-tenancy
- **Default:** shared database, shared schema. Every tenant table has `tenant_id uuid not null` as the leading column in all unique and secondary indexes.
- **RLS:** policies use `current_setting('app.tenant_id')::uuid` and `current_setting('app.user_id')`. The API opens a transaction per request and runs `SET LOCAL app.tenant_id`, `app.user_id`, `app.scope_nodes` (array) and `app.roles`. The app DB role has no `BYPASSRLS`; migrations and platform jobs use separate roles. Platform-owner reads use a dedicated `platform` role with an audited path.
- **Read scope in RLS:** tenant isolation is always enforced in RLS. Node/department scope is enforced in RLS for `cases` and related tables via a SQL function `scope_allows(node_path, department_id)` reading the session's scope arrays. Write authorisation is in the domain layer (finer-grained).
- **Dedicated tenants** (`dedicated_hosting`): a tenant registry maps tenant → connection (database/cluster). A connection router in the API selects the pool. Same migrations run per database. Tenant export/import tooling moves a tenant between shared and dedicated.
- **Tenant resolution:** custom domain or `/{tenantSlug}` path for citizen apps; staff tokens carry `tid`; webhooks resolve the tenant by provider account mapping (WhatsApp number, SMS sender, telephony DID, social account ID).
- **Noisy-neighbour control:** per-tenant rate limits (API, webhooks, provider queues), per-tenant BullMQ group concurrency, query timeouts.

## 5. Authorisation engine
- `packages/domain/auth/authorize.ts` implements the evaluation order in Product Spec §11. Inputs:
  - **actor:** user, tenant, roles with scopes, designations, charges, entitlements snapshot
  - **permission code**
  - **resource context:** case (node path, department, sub-type, assignee, vendor, state) or config entity
- Permission catalogue lives in code (`permissions.ts`): code, description, module key, default system roles. A migration syncs it to the `permissions` table. Custom roles reference codes.
- An entitlement snapshot is cached in Redis per tenant (5 min TTL) and invalidated on change.
- The API exposes `GET /me/capabilities`: permissions, scopes, entitlements, settings subset. The frontends use it for `can()` and `useEntitlement()`.
- A **decision log** (sampled; full for denials on sensitive permissions) helps debugging and audit.

## 6. Settings and vocabulary
- `settings_registry.ts` declares each setting: key, Zod schema, default, scopes, module, UI group, sensitivity (secret values are stored in the vault).
- Effective value = node override (if scope allows) → tenant → platform default. Cached and invalidated on write. Every write is audited.
- Vocabulary: base locales in `packages/i18n/locales/{lang}.json`; `tenant_label_overrides` merged at runtime and delivered with `/me/capabilities` and the public tenant bootstrap.

## 7. Domain modules (NestJS modules = bounded contexts)
`tenancy`, `auth`, `iam` (roles, permissions, grants), `settings`, `geography`, `people` (people, designations, charges, availability), `catalogue`, `workflow` (rights, approval rules, escalation rules, config versions), `cases` (lifecycle, routing, SLA, clustering, evidence), `intake` (voice/chat sessions), `messaging` (rules, templates, outbox, delivery, broadcasts), `channels` (WhatsApp, SMS, e-mail, social, telephony, kiosk, missed-call webhooks), `agents` (console, tasks, enquiries, chat handover, QC), `workforce`, `vendors` (contracts, penalties), `assets`, `analytics` (rollups, dashboards, scorecard, reports, Metabase embed), `integrations` (connectors, webhooks, API keys), `billing`, `support`, `compliance` (consent, retention, DSAR, breach), `audit`, `files`, `platform`.

Modules talk to each other through exported services or domain events only; ESLint boundary rules forbid deep imports.

## 8. Core data model (abridged; full schema in `packages/db`)
- **Platform:** `tenants`, `tenant_domains`, `tenant_connections`, `plans`, `plan_modules`, `plan_limits`, `tenant_entitlement_overrides`, `usage_events` (partitioned by month), `invoices`, `invoice_lines`, `payments`, `support_tickets`, `announcements`.
- **IAM:** `users` (phone_enc, phone_hash, email, status), `user_identities` (otp/password/oidc), `sessions`, `devices`, `permissions`, `roles`, `role_permissions`, `role_grants` (user, role, scope JSON), `impersonation_sessions`.
- **Config:** `settings_values`, `tenant_label_overrides`, `hierarchy_levels`, `hierarchy_nodes` (ltree path, PostGIS geom, LGD code), `areas`, `departments`, `designations`, `people`, `charges`, `availability` (leave/shift), `shifts`, `vendors`, `vendor_contracts`, `vendor_coverage`, `case_types`, `case_subtypes`, `subtype_fields`, `subtype_rights`, `approval_rules`, `escalation_rules`, `config_versions`, `notification_rules`, `message_templates`, `holidays`, `working_hours`, `asset_types`, `assets`, `channel_accounts`, `connectors`, `api_keys`, `webhook_subscriptions`.
- **Operations:**
  - `cases` (partitioned by tenant hash or by year, decided in an ADR after load test; key columns: case_no, kind, subtype_id, config_version_id, status, node_id, node_path, area_id, geom, citizen_id, assignee_person_id, vendor_id, priority, senior, sla_due_at, accepted_at, first_response_at, resolved_at, closed_at, breached, reopen_count, parent_case_id, channel, source_ref, flags[])
  - case-related: `case_supporters`, `case_attachments` (kind, storage key, exif, phash, gps, captured_at, flags), `case_timeline` (append-only, partitioned), `case_requests` (EOT/transfer/hold/reject/reopen/edit + approval progress), `case_approvals`, `case_escalations` (unique case+level), `feedback`, `penalties`
  - work and channels: `tasks`, `enquiries`, `intake_sessions`, `intake_turns`, `chat_threads`, `chat_messages`, `social_messages`, `email_threads`, `call_logs`, `qc_tasks`, `qc_scores`
  - other: `broadcasts`, `gram_sabha_meetings`, `ai_assessments`
- **Messaging:** `outbox_events`, `notification_jobs`, `deliveries` (provider IDs, status, cost).
- **Compliance:** `citizens` (phone_enc/hash, name_enc, language, senior, consent refs), `consents`, `retention_policies`, `dsar_requests`, `breach_incidents`, `audit_log` (append-only, partitioned, hash-chained).
- **Analytics:** `rollup_daily_node_subtype`, `rollup_hourly_live`, scorecard materialised views; reporting schema views for Metabase.

**Indexes:**
- `cases(tenant_id, status, sla_due_at)`
- `cases(tenant_id, assignee_person_id, status)`
- `cases USING gist(node_path)`
- `cases USING gist(geom)`
- `case_timeline(tenant_id, case_id, created_at)`
- unique `(tenant_id, case_no)`
- `citizens(tenant_id, phone_hash)`

## 9. Workflow engine internals
- **State machine:** a declarative table in `packages/domain/cases/stateMachine.ts` (from, action, to, guard, effects). Effects emit domain events.
- **Routing:** `packages/domain/cases/routing.ts`, a pure function over a snapshot (charges, availability, coverage, load counts) for deterministic tests. Ties: least open load, then round-robin cursor stored per (node, designation).
- **SLA calculation:** `packages/domain/sla` is working-hours and holiday aware, timezone-safe (store UTC, compute in tenant TZ), with pause/resume for on-hold when allowed.
- **Schedulers** (BullMQ repeatable jobs, each tenant-sharded):
  - `escalation-scan` (every 60 s)
  - `acceptance-timeout`, `sla-warning`
  - `auto-close`, `feedback-followup`, `feedback-ivr-dialer` (respects call window)
  - `retention-sweep` (daily), `rollups`, `report-scheduler`, `contract-expiry`
  - `penalty-evaluator`, `cluster-maintenance`, `usage-aggregation`, `invoice-run` (monthly)

  Job IDs are deterministic (`esc:{caseId}:{level}`) and DB unique constraints back idempotency.
- **Config versioning:** publishing workflow changes creates a new `config_version`; cases reference the version used at registration; the simulator can run against draft versions before publish.

## 10. Voice architecture
- **App/WhatsApp (turn-based):** upload audio → `intake` module → STT → LLM (structured output, JSON schema) → TTS → reply. Target p95 turn time is under 4 s for voice notes.
- **Phone (`voice-gateway`):** telephony provider streams bidirectional audio over WebSocket → VAD + streaming STT → partial-transcript endpointing → LLM call (streaming) → streaming TTS → audio back, with barge-in to cancel TTS. Target p95 response latency is ≤ 1.5 s after the user stops speaking. DTMF "0" or the intent "human" triggers a transfer to an agent queue (SIP transfer) or creates a callback task.
- **Session store:** Redis for live state, Postgres for durable turns. All audio is stored per retention policy.
- **Prompting:** system prompts versioned in `packages/providers/llm/prompts/` with eval tests. The tenant catalogue is injected as compact JSON (IDs, names in all languages, keywords). Candidate nodes are narrowed by caller history and GPS before injection.
- **Cost control:** per-tenant voice limits and a per-call max duration; usage events per second or token; circuit breaker falls back to an agent queue.

## 11. Channel adapters
Each adapter (`packages/providers/{kind}/{vendor}.ts`) implements an interface plus `mock.ts`. Webhooks:
- verify signatures (Meta X-Hub-Signature-256, provider HMACs)
- deduplicate by provider message ID
- acknowledge within 2 s, process asynchronously

Outbound adapters are rate-limited per provider account. WhatsApp tracks the 24-hour session window and template approval status. SMS enforces DLT template matching. Social uses webhooks where available, else polling with cursors.

## 12. Security architecture
- **TLS everywhere;** HSTS; strict CSP; secure cookies (web refresh token httpOnly, SameSite=strict); mobile tokens in secure storage.
- **Rate limiting** per IP, phone, tenant and route class (Redis token bucket). OTP: 3 per 15 minutes per phone, 10 per hour per IP, plus CAPTCHA on the public web after threshold.
- **Encryption:** disk encryption on DB and storage; application-level AES-256-GCM for phone and name columns using envelope encryption (KMS or Vault transit); keyed HMAC-SHA256 for lookups; key rotation supported.
- **Files:** MIME sniffing, size limits, ClamAV scan queue, image re-encoding (strips active content while EXIF is extracted and stored first), presigned GETs with 1-hour expiry.
- **Secrets:** Kubernetes External Secrets / Vault; never in the repo or images; gitleaks in CI.
- **Audit:** append-only hash-chained `audit_log`; admin actions, config, permission and impersonation changes; exports logged; integrity verification job.
- **Admin hardening:** 2FA mandatory for admin roles, optional IP allowlist, session timeout (staff 30 min idle), re-authentication for sensitive actions (role changes, exports, DSAR erasure).
- **OWASP ASVS L2** checklist tracked in `docs/security/asvs.md`; ZAP baseline in CI on staging; external VAPT before go-live.

## 13. Deployment
- **Images:** multi-stage, non-root, read-only filesystem, distroless/alpine, pinned digests, SBOM attached, signed (cosign).
- **Kubernetes (Helm chart `infra/helm/samadhan`):**
  - deployments: api, worker, voice-gateway, web-staff, web-citizen (static via nginx), metabase (optional)
  - HPA on CPU and queue depth; PodDisruptionBudgets; readiness, liveness and startup probes
  - pre-upgrade Job runs migrations; NetworkPolicies; resource requests and limits
- **Data services:** managed PostgreSQL, or CloudNativePG operator for on-prem (HA primary + replica, WAL archiving to object storage, PITR); Redis (managed or operator, AOF on); MinIO or S3.
- **Single-VM option** (`infra/docker/compose.prod.yml`): Caddy/Traefik TLS, api, worker, voice-gateway, web, Postgres with pgBackRest, Redis, MinIO, Grafana stack. For small on-prem customers.
- **Environments:** `dev` (local), `preview` (per PR, optional), `staging` (production-like, anonymised seed), `production`. Promotion by image digest only.
- **Release:** rolling by default; database changes follow expand/contract; feature flags via entitlements and settings; rollback = previous image + forward-fix migration.
- **Backups and DR:** PITR; daily full backups; object-storage replication to a second region or site. Targets are RPO ≤ 15 min and RTO ≤ 4 h (configurable per contract). A restore drill is scripted (`scripts/dr-drill.sh`) and run monthly.
- **Data residency:** India regions only; documented in the deployment runbook.

## 14. Observability and operations
- **Telemetry:** OpenTelemetry auto and manual instrumentation; trace ID propagated to queue jobs and provider calls; structured JSON logs with no PII (redaction middleware).
- **Dashboards:** API latency/error by route and tenant, queue depth and age per queue, scheduler lag, outbox backlog, webhook success rate per provider, voice latency and STT/LLM error rate, DB health, cost per tenant per day.
- **Alerts:**
  - error rate > 2% over 5 min
  - p95 latency > SLO
  - escalation-scan lag > 5 min
  - outbox backlog > 1,000 or oldest > 2 min
  - provider failure rate > 10%
  - disk > 80%, replication lag > 60 s, certificate expiry < 14 days, backup failure
- **SLOs:** API availability 99.5% (pilot) and 99.9% (enterprise); p95 read < 300 ms; p95 write < 600 ms; webhook ack < 2 s.
- **Status page and incident runbook** in `docs/runbooks/`.

## 15. Capacity targets (load-test against these; tune per contract)
- 5,000,000 cases stored per large tenant; 50 tenants on a shared cluster.
- Peak 50 case creations per second platform-wide; 2,000 concurrent staff sessions; 500 concurrent citizen sessions.
- WhatsApp inbound 100 messages per second burst.
- Voice: 50 concurrent phone calls per voice-gateway replica.
- Report queries on 1 year of data < 5 s via rollups.
