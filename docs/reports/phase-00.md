# Phase 0 Report — Project Scaffold

**Status:** Complete
**Branch:** `claude/vibrant-clarke-chafqg`
**Date:** 2026-10-02

## What was built

### Architecture Decision Records (7)
| ADR | Decision |
|-----|----------|
| 0001 | Modular monolith — NestJS with 3 process entry points |
| 0002 | PostgreSQL RLS for tenant isolation with `SET LOCAL` |
| 0003 | Drizzle ORM for CRUD, raw SQL for RLS/PostGIS/ltree |
| 0004 | BullMQ on Redis with deterministic idempotent job IDs |
| 0005 | Expo React Native for mobile, offline-first with sync queue |
| 0006 | Separate WebSocket service for voice gateway |
| 0007 | Case table partitioning — proposed, deferred to Phase 3 load test |

### Monorepo scaffold (13 packages)

**Apps (6):**
- `apps/api` — NestJS 11 with health controller (`/healthz`, `/readyz`), Vitest, Pino logger
- `apps/worker` — BullMQ entry point (stub, `TODO(phase-04)`)
- `apps/voice-gateway` — WebSocket media stream service (stub, `TODO(phase-06)`)
- `apps/web-staff` — React + Vite on port 5173 (stub, `TODO(phase-05)`)
- `apps/web-citizen` — React + Vite PWA on port 5174 (stub, `TODO(phase-05)`)
- `apps/mobile` — Expo React Native (stub, `TODO(phase-08)`)

**Packages (7):**
- `packages/domain` — Pure TS business rules with `authorize()` stub and tests
- `packages/db` — Drizzle ORM + postgres driver (schema stub)
- `packages/contracts` — Zod re-export (schemas stub)
- `packages/providers` — Provider adapters (stub)
- `packages/ui` — Design tokens (colors, spacing, typography) + accessible `Button` component
- `packages/i18n` — i18next with en/hi locales (48 keys each), vocabulary override merge
- `packages/config` — ESLint flat configs (base, react, node)

### Infrastructure
- `infra/docker/compose.dev.yml` — PostGIS 16, Redis 7 (AOF), MinIO (with auto bucket), Mailpit
- `infra/docker/.env.example` — Environment variable template
- `.github/workflows/ci.yml` — Install → lint → typecheck → test → integration → build
- `.github/workflows/security.yml` — pnpm audit + gitleaks

### Tooling
- pnpm 10.28 workspaces with `pnpm-workspace.yaml`
- Turborepo task pipeline (`turbo.json`)
- TypeScript 5.8 strict mode with `tsconfig.base.json` (ES2022, Node16 resolution)
- ESLint 9 flat config at root
- Prettier config

## Acceptance evidence

```
pnpm verify — all 4 stages green:

1. lint:       0 errors, 0 warnings
2. typecheck:  18/18 turbo tasks passed
3. test:       11/11 tests passed
   - packages/domain: 2 (authorize returns result with allowed property)
   - packages/i18n:   7 (locale key parity, no empty values, vocabulary merge)
   - apps/api:        2 (health controller /healthz and /readyz)
4. build:      12/12 turbo tasks passed
```

## Cloud environment adaptations
- Docker Compose is provided for reference/local use but not started in the cloud session
- CI workflows use GitHub-hosted services (postgres, redis) instead of Docker
- All commands run natively (Node 22, pnpm)

## Known limitations
- All app entry points except `apps/api` are stubs with `TODO` markers
- No database schema, migrations, or seeds yet (Phase 1)
- No RLS policies yet (Phase 1)
- No authentication or authorization implementation yet (Phase 1)
- `packages/config` ESLint presets are not wired into workspaces (using root flat config)
- Integration tests not yet written (no database to test against)

## Stubs remaining
| Location | TODO marker | Target phase |
|----------|------------|--------------|
| `packages/domain/src/auth/index.ts` | `TODO(phase-01)` | Phase 1 |
| `apps/worker/src/main.ts` | `TODO(phase-04)` | Phase 4 |
| `apps/voice-gateway/src/main.ts` | `TODO(phase-06)` | Phase 6 |
| `apps/web-staff/src/main.tsx` | `TODO(phase-05)` | Phase 5 |
| `apps/web-citizen/src/main.tsx` | `TODO(phase-05)` | Phase 5 |
| `apps/mobile/src/App.tsx` | `TODO(phase-08)` | Phase 8 |

## Follow-ups for Phase 1
1. Database schema: tenants, users, roles, permissions, settings tables
2. RLS policies with `SET LOCAL` per request
3. Drizzle migrations and seed data
4. Authentication (JWT + refresh tokens)
5. Full `authorize()` implementation with entitlements, roles, scopes
6. Tenant settings registry
7. Permission catalogue
