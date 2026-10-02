# ADR-0004: BullMQ for Job Queues and Scheduling

## Status
Accepted

## Context
Samadhan needs reliable background job processing for: transactional outbox relay, notification dispatch, escalation scans, SLA warnings, auto-close, feedback dialers, retention sweeps, analytics rollups, billing runs, and more. Jobs must be:
- Persistent across restarts
- Retryable with backoff
- Rate-limited per provider account
- Tenant-isolated (noisy-neighbour prevention)
- Idempotent (safe to run twice)

Options considered:
1. **BullMQ** (Redis-backed) — mature, feature-rich (delayed jobs, repeatable jobs, rate limiting, group concurrency, job deduplication), TypeScript-first.
2. **pg-boss** (Postgres-backed) — simpler, no Redis dependency, but fewer features (no streaming, no rate limiting, no group concurrency).
3. **Temporal** — powerful workflow engine but heavy infrastructure, steep learning curve, overkill for our patterns.

## Decision
We use **BullMQ** on Redis 7 with AOF persistence.

Key design decisions:
- **Deterministic job IDs** (e.g. `esc:{caseId}:{level}`) enforce idempotency. Running a scheduler twice produces no duplicates.
- **Per-tenant group concurrency** prevents one tenant's bulk operations from starving others.
- **Rate-limited queues** per provider account (WhatsApp, SMS, etc.) respect provider API limits.
- **Repeatable jobs** for schedulers (escalation scan every 60s, etc.) with tenant sharding.
- The **worker** process is a separate entry point from the same codebase, deployed as its own container, horizontally scalable.

## Consequences
- **Redis dependency:** adds Redis to the infrastructure. Acceptable because we already need Redis for caching (entitlements, settings) and session state (voice gateway).
- **Redis persistence:** AOF must be enabled. A Redis data loss means in-flight jobs are lost; the transactional outbox in Postgres is the source of truth and replays unprocessed events.
- **Monitoring:** BullMQ exposes queue depth, age, and failure metrics. We feed these to Prometheus/Grafana with alerts on backlog.
