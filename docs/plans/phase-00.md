# Phase 0 — Foundations and Scaffolding

## Goal
Set up the monorepo, development environment, CI pipeline, base UI components, and i18n scaffold so that all subsequent phases have a solid foundation to build on.

## Cloud Environment Adaptations
This project is being built in a cloud-based Claude Code session, not on a local computer. The following adaptations apply:
- **Docker Compose for dev** (`compose.dev.yml`): will be written but may not be fully runnable inside the cloud container (limited Docker-in-Docker support). Services like Postgres, Redis, and MinIO will be configured for local dev use. In this cloud session, we use Testcontainers for integration tests, which spins up containers as needed.
- **CI pipeline**: configured for GitHub Actions, triggered on pushes and PRs.
- **Storybook**: will be configured but visual review happens via browser; we test components with axe programmatically.

## Tasks

### Task 0.1: ADRs (2 hours)
Write architecture decision records for Phase 0 decisions.
- **Files:** `docs/adr/0001-modular-monolith.md` through `docs/adr/0007-case-table-partitioning.md`
- **Status:** DONE

### Task 0.2: Monorepo scaffold (4 hours)
Set up pnpm workspaces, Turborepo, and all package/app directories per CLAUDE.md §3.
- **Files:**
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - `package.json` (root)
  - `tsconfig.base.json`
  - `.npmrc`
  - Per workspace: `apps/api/package.json`, `apps/worker/package.json`, `apps/voice-gateway/package.json`, `apps/web-staff/package.json`, `apps/web-citizen/package.json`, `apps/mobile/package.json`
  - Per package: `packages/domain/package.json`, `packages/db/package.json`, `packages/contracts/package.json`, `packages/providers/package.json`, `packages/ui/package.json`, `packages/i18n/package.json`, `packages/config/package.json`
  - TypeScript configs per workspace extending `tsconfig.base.json`
- **Commands:** `pnpm install` succeeds
- **Tests:** none yet (scaffold only)

### Task 0.3: Linting and formatting (2 hours)
Set up ESLint (with module boundary rules and the no-literal-strings rule for JSX), Prettier, and shared configs.
- **Files:**
  - `packages/config/eslint/base.js` — shared ESLint config
  - `packages/config/eslint/react.js` — React-specific rules
  - `packages/config/eslint/node.js` — Node/API-specific rules
  - `.prettierrc`, `.prettierignore`
  - Per workspace: `.eslintrc.js` extending shared config
- **Commands:** `pnpm lint` runs across all workspaces
- **Tests:** ESLint rule for no hard-coded strings in JSX (`i18n/no-literal-strings`)

### Task 0.4: Testing infrastructure (2 hours)
Set up Vitest with shared presets, Testcontainers for integration tests, Playwright for E2E.
- **Files:**
  - `packages/config/vitest/base.ts` — shared Vitest config
  - `packages/config/vitest/integration.ts` — Testcontainers setup (Postgres, Redis, MinIO)
  - `packages/config/playwright/base.ts` — Playwright config
  - Per workspace: `vitest.config.ts`
- **Commands:** `pnpm test` runs unit tests; `pnpm test:integration` runs with Testcontainers
- **Tests:** a smoke test in `packages/domain` that passes

### Task 0.5: Docker Compose dev environment (3 hours)
Write `compose.dev.yml` with all required services.
- **Files:**
  - `infra/docker/compose.dev.yml` — Postgres 16 + PostGIS, Redis 7, MinIO, Mailpit, mock-provider server, Grafana, Loki, Tempo, Prometheus
  - `infra/docker/.env.example` — env var template
  - Docker health checks for all services
- **Commands:** `pnpm dev` (or `docker compose -f infra/docker/compose.dev.yml up`)
- **Tests:** health check endpoints respond

### Task 0.6: CI pipeline (3 hours)
GitHub Actions workflow for PRs and main branch.
- **Files:**
  - `.github/workflows/ci.yml` — install, lint, typecheck, unit, integration, build
  - `.github/workflows/security.yml` — Semgrep, Trivy, gitleaks, pnpm audit, SBOM generation
  - `.github/workflows/docker.yml` — Docker build and push on main
- **Commands:** CI green on a PR
- **Tests:** CI itself is the test

### Task 0.7: NestJS API bootstrap with observability (4 hours)
Minimal NestJS app with OpenTelemetry, structured logging, health endpoints.
- **Files:**
  - `apps/api/src/main.ts` — NestJS bootstrap
  - `apps/api/src/app.module.ts` — root module
  - `apps/api/src/health/` — `/healthz` and `/readyz` endpoints
  - `apps/api/src/common/logger/` — structured JSON logger with PII redaction
  - `apps/api/src/common/telemetry/` — OpenTelemetry setup (traces, metrics)
  - `apps/api/src/common/errors/` — error tracking integration point
- **Commands:** `pnpm --filter api dev` starts; `/healthz` returns 200
- **Tests:** integration test for health endpoints

### Task 0.8: Design system foundation (4 hours)
Base UI components in `packages/ui` with design tokens, axe tests, and Storybook.
- **Files:**
  - `packages/ui/src/tokens/` — colours, typography scale, spacing, touch target sizes (56px min per spec)
  - `packages/ui/src/components/Button/`, `Input/`, `Card/`, `Layout/` — base components
  - `packages/ui/src/index.ts` — barrel export
  - `packages/ui/.storybook/` — Storybook config
  - `packages/ui/src/components/**/*.test.tsx` — axe accessibility tests per component
- **Commands:** `pnpm --filter ui storybook` runs; `pnpm --filter ui test` passes
- **Tests:** axe tests for each component; rendering tests

### Task 0.9: i18n scaffold (2 hours)
Set up the i18n package with locale files and the runtime merge mechanism.
- **Files:**
  - `packages/i18n/src/index.ts` — i18n setup (react-i18next)
  - `packages/i18n/locales/en.json` — English strings
  - `packages/i18n/locales/hi.json` — Hindi strings
  - `packages/i18n/locales/[REGIONAL].json` — placeholder for pilot regional language
  - `packages/i18n/src/merge.ts` — tenant vocabulary override merge logic
- **Commands:** `pnpm --filter i18n test`
- **Tests:** unit test for vocabulary merge logic; test that all keys in `en` exist in `hi`

### Task 0.10: Verify and commit (1 hour)
Wire up all `pnpm` scripts, ensure `pnpm verify` runs lint + typecheck + unit + integration + build.
- **Files:**
  - Root `package.json` scripts: `dev`, `verify`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `build`
  - `turbo.json` pipeline configuration
- **Commands:** `pnpm verify` green
- **Tests:** the verify script itself

## Acceptance Gate
- [  ] `pnpm dev` starts the stack (or equivalent in cloud: services are reachable)
- [  ] `pnpm verify` is green (lint, typecheck, unit, integration, build)
- [  ] CI is green on a PR
- [  ] Storybook runs (components render with axe passing)
- [  ] ADRs 0001-0007 are committed
- [  ] All i18n keys in `en` have counterparts in `hi`

## Risks
1. **Docker-in-Docker in cloud sessions:** Testcontainers requires Docker. If the cloud environment doesn't support it, we fall back to test-specific Postgres/Redis instances or use the CI pipeline for integration tests.
2. **Storybook visual testing:** without a persistent browser, visual review is limited. We rely on axe programmatic tests and Playwright component tests.
3. **pnpm workspace resolution:** complex monorepo dependency graphs can cause issues. We pin versions carefully and use `catalog:` protocol where available.

## Estimated Time
~25 hours of implementation work (one person, or parallelisable across tasks).
