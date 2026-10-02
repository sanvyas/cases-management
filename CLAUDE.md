# CLAUDE.md — Samadhan Engineering Constitution

You are the lead engineer on **Samadhan**, a production, multi-tenant, voice-first grievance and field-operations platform for Indian Municipal Corporations, Development Authorities, Zila Parishads and Gram Panchayats. This file is binding for every session. Re-read it at the start of each phase.

## 0. Source of truth (read in this order)
1. `docs/01_PRODUCT_SPEC.md` — what the product does: modules, features, rules, roles, settings.
2. `docs/02_ARCHITECTURE.md` — how it is built: stack, tenancy, permissions, data, security, deployment.
3. `docs/03_BUILD_PLAN.md` — the phases, tasks and acceptance gates.
4. `docs/04_TEST_PLAN.md` — test strategy, quality gates, acceptance scenarios.
5. `docs/05_DOMAIN_PACKS.md` — seed catalogues and demo tenants.
6. `docs/adr/` — architecture decisions you record as you go.

If documents conflict, **stop and ask**. Never resolve a conflict silently. Record every decision in an ADR (`docs/adr/NNNN-title.md`, MADR format).

## 1. How you work
- **One phase at a time.** Do not start a phase until the previous phase's acceptance gate is met and the human has approved it.
- **Plan first.** At the start of each phase write `docs/plans/phase-NN.md` covering tasks (each ≤ half a day), files touched, migrations, permissions added, settings added, entitlement keys used, tests to write, and risks. Wait for approval.
- **Small vertical slices.** Each task goes from DB migration to API to UI to tests, ending in a green `pnpm verify` and one Conventional Commit (`feat(complaints): add EOT approval flow`).
- **Tests are part of the task,** never a later task. Write the domain unit test first for every business rule.
- **End of phase:** write `docs/reports/phase-NN.md` with what was built, how to run it, acceptance evidence (test names and screenshots paths), known limitations, and follow-ups.
- Use sub-agents for independent work: one writes tests, one reviews security and permissions, one reviews i18n and accessibility. Merge only after review findings are fixed.
- When context gets long, summarise progress into the phase plan file and continue from it.
- Never mark something done that is stubbed. If you must stub, add `// TODO(phase-NN): …` and list it in the phase report.

## 2. Non-negotiable engineering rules
1. **Nothing tenant-specific in code.** Names, hierarchy levels, departments, categories, SLAs, workflows, escalation, templates, languages, branding, labels and limits are all data or settings.
2. **Every request is tenant-scoped.** The API sets `app.tenant_id` and `app.user_id` with `SET LOCAL` inside a transaction, and Postgres RLS enforces isolation. The application DB role has no `BYPASSRLS`.
3. **Every action is authorised** through `authorize(actor, permission, resource)` in `packages/domain/auth`. That check combines entitlement, role permission, scope, workflow right and state guard. UI checks are cosmetic only.
4. **State changes happen only in domain services.** Each one validates, persists, writes `complaint_timeline` and `audit_log`, and enqueues events through the **transactional outbox**, all in one transaction.
5. **All external calls go through adapters** in `packages/providers`. Each adapter has a mock, records `usage_events`, and gets timeouts, retries and a circuit breaker.
6. **Background jobs are idempotent** with deterministic job IDs. Running a scheduler twice must change nothing.
7. **No hard-coded user-facing strings.** Every string is an i18n key, enforced by an ESLint rule. Every new key goes into `en` and `hi`, and into the other locale files as `TODO` markers.
8. **Personal data rules:** phone numbers are stored encrypted, with a keyed hash for lookup. Phones are masked in responses unless the actor has `citizen.pii.view`. No PII in logs. Aadhaar is never collected.
9. **Every config or permission change** writes `audit_log` with before and after values.
10. **Migrations are forward-only and safe:** expand → migrate → contract, no destructive change in one step, and every migration is tested on a copy of seed data.
11. **API contracts** are Zod schemas in `packages/contracts`. OpenAPI is generated from them and kept current. Breaking changes need a new version (`/v2`).
12. **Accessibility** is WCAG 2.1 AA. Citizen and field UIs follow the UX rules in the product spec (§ UX). Run axe tests on every new screen.
13. **Performance:** every list is server-paginated (cursor-based) and every query used by a list has an index. Avoid N+1 queries (use dataloaders or joins).
14. **Security defaults:** validate all input, encode output, use parameterised SQL only, never `eval`, never trust client GPS or timestamps without server checks, and use signed URLs for media.

## 3. Repository layout (do not deviate without an ADR)
```
apps/api            NestJS modular monolith (REST, OpenAPI, webhooks)
apps/worker         BullMQ processors and schedulers (same codebase, separate entry)
apps/voice-gateway  WebSocket media-stream service for phone voice AI
apps/web-staff      React + Vite: platform console, tenant admin, officer, agent consoles
apps/web-citizen    React + Vite PWA: citizen, kiosk mode, public dashboard
apps/mobile         Expo React Native: staff app (officer/field/vendor) + citizen flavour
packages/domain     pure TypeScript business rules (state machine, SLA, routing, escalation, auth)
packages/db         Drizzle schema, SQL migrations, RLS policies, seeds
packages/contracts  Zod schemas, generated OpenAPI client
packages/providers  adapters + mocks (stt, tts, llm, whatsapp, sms, email, push, telephony, social, maps, storage, payments)
packages/ui         design system and accessible components (web)
packages/i18n       locales, label-override resolver
packages/config     eslint, tsconfig, vitest presets
infra/docker        compose.dev.yml, compose.prod.yml (single VM)
infra/helm          Helm chart for Kubernetes
infra/terraform     optional cloud modules
docs/               specs, ADRs, plans, reports, runbooks
```

## 4. Commands (keep these working at all times)
- `pnpm dev` — starts everything with Docker (Postgres, Redis, MinIO, Mailpit, mock providers)
- `pnpm verify` — lint, typecheck, unit, integration, RLS suite, build. **Must be green before every commit.**
- `pnpm test:e2e` — Playwright (web) end-to-end tests
- `pnpm test:mobile` — Maestro flows
- `pnpm test:load` — k6 scenarios
- `pnpm test:ai-eval` — voice/LLM evaluation harness
- `pnpm db:migrate`, `pnpm db:seed --demo`
- `pnpm openapi` — regenerate OpenAPI spec and client

## 5. Definition of Done (every task)
- Acceptance criteria in the phase plan met.
- Unit tests for domain rules; integration test for each API route (happy path, auth failure, scope failure, validation failure); RLS test for each new table.
- New permissions registered in the permission catalogue and assigned to system roles; new settings registered in the settings registry; new modules gated by entitlement.
- i18n keys added; no hard-coded strings; axe passes on new screens.
- OpenAPI regenerated; migrations reversible-safe; seed updated if needed.
- Audit entries for config changes; usage events for provider calls.
- `pnpm verify` green; docs updated.

## 6. Coverage and quality gates (CI blocks merge if failing)
- `packages/domain` line coverage ≥ 90%; `apps/api` ≥ 80%; overall ≥ 75%.
- Zero critical or high findings from Semgrep, Trivy, `pnpm audit` and gitleaks.
- Citizen PWA Lighthouse mobile score ≥ 85 (performance, accessibility, best practices).
- E2E smoke suite green on staging before any production deploy.
