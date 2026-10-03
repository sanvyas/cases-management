# 03 — Build Plan: Samadhan v1.0

Fifteen phases grouped into four releases. Each phase ends with an **acceptance gate** that the human verifies before the next phase starts. Acceptance-test IDs (`AT-xx`) refer to `docs/04_TEST_PLAN.md`.

| Release | Phases | Outcome |
|---|---|---|
| **R1 Core platform** | 0–5 | Multi-tenant platform, configuration, case engine, messaging, staff web, citizen PWA |
| **R2 Voice & field** | 6–8 | Voice AI (app, WhatsApp, phone), WhatsApp bot, mobile apps, workforce and vendors |
| **R3 Channels & intelligence** | 9–11 | Agent console, QC, social/e-mail, integrations, analytics, AI features |
| **R4 Business & compliance** | 12–14 | Billing, support, migration, DPDP, hardening, release 1.0 |

---

## Phase 0 — Foundations and scaffolding
**Tasks**
1. Read all docs. Write ADRs for: modular monolith; Postgres RLS tenancy; Drizzle plus raw SQL; BullMQ; Expo; voice-gateway design; case table partitioning strategy (decide after the Phase 3 load test; record the candidate options now).
2. Scaffold the monorepo (layout in CLAUDE.md §3) with strict TypeScript, ESLint (including module-boundary rules and the no-literal-strings rule for JSX), Prettier, Vitest, Playwright, Testcontainers.
3. `infra/docker/compose.dev.yml`: Postgres 16 + PostGIS, Redis, MinIO, Mailpit, a mock-provider server, Grafana/Loki/Tempo/Prometheus.
4. CI pipeline:
   - install, lint, typecheck, unit, integration (Testcontainers), build
   - Semgrep, Trivy, gitleaks, audit, SBOM
   - Docker build and push on main
5. OpenTelemetry baseline, structured logger with PII redaction, error tracking, health endpoints (`/healthz`, `/readyz`).
6. `packages/ui` design tokens (colour, type scale, spacing, touch sizes), base components with axe tests, Storybook.
7. `packages/i18n` scaffold with `en`, `hi` and placeholders for `[REGIONAL]`.

**Gate:** `pnpm dev` starts the stack; `pnpm verify` is green; CI is green on a PR; Storybook runs; ADRs are committed.

## Phase 1 — Tenancy, IAM, permissions, settings, entitlements, audit
**Tasks**
1. Tenancy schema and RLS; request transaction with `SET LOCAL` context; platform/migrator/app DB roles; RLS test harness (matrix runner).
2. Auth: phone OTP (SMS/WhatsApp adapters, mock in dev), TOTP 2FA, optional staff password, sessions and devices, rotating refresh tokens, logout everywhere, account lockout.
3. IAM: permission catalogue (code-first and synced), system roles from Product Spec §2, custom roles (clone/edit within entitlements), role grants with scopes, `authorize()` with full evaluation order, `/me/capabilities`.
4. Settings registry and effective-value resolution, with an auto-generated settings UI from schemas.
5. Entitlements: modules, plans, limits, overrides, trials; Redis cache; API guard decorator `@RequireModule()`; frontend `useEntitlement()`; graceful-downgrade helper.
6. Vocabulary overrides and the runtime i18n merge.
7. Audit log (hash-chained), audit viewer, impersonation with reason, banner and notifications.
8. **Platform console:** tenants CRUD, plans/modules/limits, overrides, trials, impersonation, announcements.
9. **Staff web shell:** login, tenant switcher, role-aware navigation, language switcher.

**Gate:** AT-01, AT-02, AT-03, AT-30 pass; RLS suite covers every table so far; a custom role cannot exceed plan modules.

## Phase 2 — Tenant configuration, domain packs, onboarding
**Tasks**
1. Geography: levels, node tree (create/move/merge/deactivate with impact preview), areas, LGD CSV import with diff preview, boundary GeoJSON upload, node-from-GPS lookup.
2. People: people master (all types), designations tree, charges (incl. temporary), availability and leave basics, user invites, bulk import.
3. Catalogue: departments, types, sub-types (all fields of Product Spec §5), icons library, multilingual names, voice keywords, custom fields.
4. Workflow: rights matrix UI, approval rules (ATR/EOT/Transfer/Hold/Reject/Reopen), escalation builder with three trigger bases and plain-language preview, config versions (draft → publish), diff view.
5. Messages config: notification rules matrix, templates per language with preview, SMS length/Unicode counter, DLT and WhatsApp template fields.
6. Calendars: holidays, working hours.
7. Domain packs `urban_v1` and `rural_v1` (see 05) with transactional "apply pack".
8. Onboarding wizard and Excel import/export for all templates listed in Product Spec §13, with row-level validation reports.
9. **Routing Simulator** (against draft or published versions) and **Health Check** with fix links.
10. Transfers/promotions wizard and node-move wizard with open-case policies (they exercise the case engine stub; finalise in Phase 3).

**Gate:** AT-04, AT-05, AT-06 pass; the demo rural tenant onboarded from Excel passes Health Check with zero errors.

## Phase 3 — Case engine
**Tasks**
1. Domain: state machine, routing (all modes, availability, fallback), SLA calculator (working hours, holidays, pause), escalation evaluator (three bases, 7 levels, notify-only), clustering, photo-check rules, penalty evaluator, spam rules. Domain coverage ≥ 90%.
2. Case number generator (per-tenant prefix, race-safe sequence).
3. API commands for every action in Product Spec §5.4 and §5.6. Each command runs in one transaction with timeline, audit and outbox entries.
4. Evidence pipeline: presigned upload → server EXIF extraction → pHash → ClamAV → image re-encode → flags.
5. Schedulers (Architecture §9), idempotent with deterministic job IDs.
6. Enquiries, on-hold, reject-as-fake, senior-citizen priority, supporters and incidents.
7. Finalise the transfer/promotion and node-move wizards with open-case handling.
8. Load test 1 (k6): case creation and inbox queries at target volume; decide case partitioning and write the ADR.

**Gate:** AT-07 to AT-17 pass; the load-test report meets Architecture §15 for the case paths.

## Phase 4 — Messaging and notifications
**Tasks**
1. Transactional outbox relay, notification job planner (rules × recipients × channels), per-channel queues with provider rate limits.
2. Adapters (real + mock): SMS (DLT), WhatsApp (Meta Cloud API and one BSP), e-mail (SMTP/SES), push (FCM / web push).
3. Delivery receipts, retries with back-off, channel fallback, quiet hours, daily digests.
4. Broadcasts (`broadcast`) with duplicate suppression hooks into registration.
5. Notification log and cost view per tenant; usage events.

**Gate:** AT-18, AT-19 pass; every event in Product Spec §6 has a test asserting the recipients and channels.

## Phase 5 — Staff web and citizen PWA
**Tasks**
1. **Staff web:** dashboards (basic), inbox tabs with realtime, case detail, action panels (only allowed actions), bulk actions, search and filters, saved views, map view.
2. **Citizen PWA:** tenant bootstrap, language picker, home with mic placeholder (voice arrives in Phase 6), picture flow, location (GPS + map confirm + picker), camera-first media, track, progress strip, 👍/👎 feedback, OTP when needed, offline shell, TTS "listen" (adapter).
3. QR assets (`qr_assets`): asset types and register, QR sticker PDF sheets, scan route with prefill.
4. Public dashboard (`public_dashboard`).
5. Kiosk mode (`kiosk`): full-screen touch UI, idle reset, token slip printing (browser print or ESC/POS bridge ADR).
6. Elected rep view (`elected_rep_view`) and Gram Sabha (`gram_sabha`).
7. Usability round 1 with real users (script in test plan); fix findings.

**Gate:** AT-20, AT-21, AT-22, AT-23 pass; Lighthouse ≥ 85; axe clean; usability task success ≥ 80% unaided.

---

## Phase 6 — Voice AI (app, WhatsApp voice notes, phone)
**Tasks**
1. Provider adapters: STT, TTS, LLM, with mocks, timeouts, circuit breakers, usage events, per-tenant provider selection.
2. Intake engine (Product Spec §7): sessions, slots, strict JSON structured output with validation and one retry, guardrails, location strategy (polygon/nearest node, phonetic fuzzy match across languages), confirmation read-back, `NEEDS_CLASSIFICATION` path, consent prompt.
3. In-app voice UI (push-to-talk and tap-toggle, live transcript in large text, playback).
4. WhatsApp voice-note intake path (shared engine).
5. `voice-gateway`: telephony WebSocket media streams, VAD, streaming STT, endpointing, streaming TTS, barge-in, DTMF, agent transfer or callback, call recording, per-call limits. Classic IVR fallback menus and outbound feedback dialer (press 1 / 0).
6. **AI evaluation harness** (`pnpm test:ai-eval`): golden datasets (audio + transcript + expected sub-type/node/intent), metrics (intent accuracy, sub-type top-1/top-3, node accuracy, turns per case, latency, cost), CI gate on prompt or model change.
7. **Channel Simulator** (staff-only): fake WhatsApp chat and fake phone call against mock transports, with mic recording for real-STT testing.

**Gate:** AT-24 to AT-27 pass; eval meets thresholds in the test plan on the seed dataset; phone p95 response latency ≤ 1.5 s in the staging load test with 50 concurrent calls (or documented provider-limited result).

## Phase 7 — WhatsApp bot and field WhatsApp
**Tasks**
1. Bot flows: menu (New complaint, Track, Feedback, Talk to person, Language, Help), list and button messages, location and media capture, session window and template handling, opt-out.
2. Live-agent handover with chat threads routed to the agent console (Phase 9 builds the full console; build the handover API and a minimal inbox now).
3. `field_whatsapp`: task card, Accept / Need more time / Done buttons, EOT by buttons, ATR via photo + location, voice-note remarks.
4. `missed_call`: number webhook → callback job (voice AI outbound call or agent task) within the configured minutes.
5. `sms_inbound`: short-code parser with aliases, `STS`, error replies.
6. `knowledge_bot`: tenant knowledge base (FAQs, scheme info, office timings) with retrieval-grounded answers in bot and voice; "I don't know" fallback to agent; KB admin UI.

**Gate:** AT-28, AT-29, AT-31, AT-32 pass.

## Phase 8 — Mobile apps, workforce, vendors, penalties
**Tasks**
1. **Expo staff app:** login (OTP + device binding), my counts, inbox, case detail, one-decision approvals, voice remarks, camera-only ATR with watermark, offline DB and sync queue (conflict rules: server state wins; local actions re-validated on sync with a clear user message), push, background location while on duty (opt-in, setting-driven).
2. **Expo citizen flavour:** same flows as the PWA plus native camera and push. Play Store build pipeline (EAS), app signing, versioning, in-app update prompt.
3. **Workforce:** shifts and rosters, attendance check-in with GPS radius, leave, availability feeding routing, FRT self-registration with approval, mobilise/demobilise, live map of on-duty staff, KPIs.
4. **Vendors:** onboarding with documents, contracts and expiry alerts, coverage, vendor portal (web + app role), two-way messages, performance scorecards.
5. **Penalties:** rules, evaluator, ledger, approvals and waivers, export.
6. Maestro mobile E2E flows.

**Gate:** AT-33 to AT-36 pass; offline ATR works in airplane-mode test; Play Store internal-testing build installs and passes smoke.

---

## Phase 9 — Agent console and QC
**Tasks**
1. Agent desktop: CTI integration via telephony adapter (incoming pop-up, click-to-call, masked calling), citizen search and history, fast registration with dictation, enquiry logging, disposition codes, agent status, task queues (follow-up, feedback callback, missed-call, classification review), live chat inbox (WhatsApp/web), canned responses.
2. Team-lead views: live queue board, agent status board, SLA on tasks.
3. QC module: task scheduler, manual creation, auditor scoring form (configurable parameters), audio playback, supervisor remarks, final score views. AI auto-scoring of all calls (transcript-based rubric) with human sampling.

**Gate:** AT-37, AT-38 pass.

## Phase 10 — E-mail control room, voice inbound, integrations hub, public API
**Tasks**
1. Voice inbound (`voice_inbound`): process uploaded call recordings, run STT transcription to extract complaint details, auto-create cases from transcripts with department detection.
2. E-mail channel (`email_channel`): IMAP/Graph/Gmail ingestion, threading, eight actions, outbound replies with tenant sender.
3. Integrations hub: connector framework, credential vault, mapping UI, message log, retries, reconciliation report; built-in connectors per Product Spec §16 (generic REST/webhook plus at least two concrete reference implementations behind mocks: a state-portal two-way connector and a billing lookup connector).
4. Public API (API keys with scopes and rate limits), outbound signed webhooks, developer docs page.
5. Vehicle GPS feed and GIS layer display on maps.

**Gate:** AT-39 to AT-42 pass.

## Phase 11 — Analytics, reports and AI insights
**Tasks**
1. Rollup pipeline (hourly/daily) and reporting schema on a read replica.
2. Dashboards: full KPI set, drill-down, ageing, reopen, feedback, channel mix, spatial node map with filters, heat maps, repeated locations, composite scorecard with configurable weights.
3. Every standard report in Product Spec §15 with filters, CSV/Excel/PDF export, async export jobs for large data.
4. Metabase embedding (`custom_reports`) with signed embeds and tenant/scope row filters; scheduled e-mail reports.
5. `analytics_ai`: anomaly detection (spikes, fast closures, ageing outliers, repeated reopening), hotspots, seasonal forecast (with a "not enough history" state), all advisory.
6. `ai_work_assessment`: vision-model before/after comparison, confidence, concerns, shown to approvers, model version stored, eval set.
7. Senior citizen module extras: nearby help points map (configurable POIs), emergency button with fallback form, campaign pages.

**Gate:** AT-43 to AT-46 pass; dashboard totals reconcile with the case register (automated test); 1-year report queries < 5 s.

---

## Phase 12 — SaaS business operations
**Tasks**
1. Usage aggregation, limits enforcement modes (warn / block channel / allow overage), cost and margin dashboards.
2. Billing: subscriptions, monthly invoice run, GST computation (place of supply), PDF invoices, credit notes, payments (manual + Razorpay adapter), dunning, suspension to read-only mode and reactivation.
3. Support desk for tenant admins with SLA and linked impersonation.
4. Legacy migration tool (case import wizard) and tenant export/offboarding (full export bundle, then scheduled deletion).
5. Platform metrics page (pilot proof metrics).

**Gate:** AT-47, AT-48, AT-49 pass.

## Phase 13 — Compliance and privacy
**Tasks**
1. Consent capture across channels (spoken for voice), consent records, privacy notices per language.
2. Retention policies per data class with sweep jobs (audio, photos, PII, cases) and anonymisation.
3. DSAR workflow (access, correction, erasure) with identity verification and SLA; erasure respects legal holds.
4. Breach incident register and notification workflow; CERT-In log retention configuration.
5. Accessibility audit fixes (GIGW/WCAG 2.1 AA) on all citizen and staff screens.

**Gate:** AT-50, AT-51 pass; accessibility report has no AA violations.

## Phase 14 — Hardening and release 1.0
**Tasks**
1. Full security review against ASVS L2, ZAP baseline clean, dependency and image scans clean, threat model (`docs/security/threat-model.md`).
2. Load test 2 at Architecture §15 targets (cases, inbox, webhooks, voice, reports); tune indexes, pools and HPA.
3. DR drill (restore to a new cluster from backup; measure RPO/RTO); chaos checks (kill worker mid-job, Redis restart, provider outage → fallback).
4. Helm chart production values (Kubernetes) and `compose.prod.yml` (single VM) verified from scratch on clean machines; deployment runbook.
5. Documentation:
   - admin guide, officer quick-start, field and vendor guides (localised, with screenshots)
   - API docs, runbooks (incident, on-call, provider onboarding: DLT, WhatsApp templates, telephony)
   - release notes
6. Seed and anonymised staging dataset; final E2E regression on staging; tag `v1.0.0`.

**Gate:** all AT-xx pass on staging; load, DR and security reports approved; a clean-machine deployment completes in under 2 hours following the runbook.
