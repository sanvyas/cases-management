# ADR-0007: Case Table Partitioning Strategy

## Status
Proposed (decision deferred to Phase 3 load test)

## Context
The `cases` table is the highest-volume table in the system. Architecture targets:
- 5,000,000 cases per large tenant
- 50 tenants on a shared cluster
- Potentially 250,000,000 rows total on a mature shared cluster

Query patterns:
1. **Inbox queries** (most frequent): filter by tenant_id + status + assignee, ordered by sla_due_at. Always tenant-scoped.
2. **Case detail:** lookup by tenant_id + case_id (primary key).
3. **Search:** by case_no, citizen phone hash, date range, node path, sub-type.
4. **Reports:** aggregations by tenant, date range, node, sub-type, status.
5. **Spatial:** PostGIS queries within a bounding box or polygon.

Related tables (`case_timeline`, `case_attachments`, `case_requests`, `case_approvals`, `case_escalations`) are always accessed via case_id and should co-locate.

## Candidate Options

### Option A: Hash partition by tenant_id
- Pros: queries are always tenant-scoped so partition pruning is effective; even distribution; straightforward.
- Cons: a single large tenant's partition could still grow large; cross-tenant platform queries hit all partitions.

### Option B: Range partition by created_at (year or quarter)
- Pros: natural for time-range reports; old partitions can be archived or moved to cheaper storage.
- Cons: inbox queries (current cases) hit the latest partition which is the hottest; no tenant pruning benefit.

### Option C: Composite (list by tenant, then range by date)
- Pros: best pruning for both tenant-scoped and time-range queries.
- Cons: operational complexity; partition count grows with tenants × time periods; requires automated partition management.

### Option D: No partitioning (rely on indexes)
- Pros: simplest; with proper indexes (tenant_id leading), performance may be sufficient at target scale.
- Cons: vacuum and maintenance on a 250M-row table; index sizes.

## Decision
**Deferred.** We will build Phase 3 without partitioning (Option D) and run the load test at Architecture §15 targets. If query performance or maintenance becomes problematic, we will choose between Options A and C based on observed query patterns and implement partitioning as a migration.

The schema design already ensures `tenant_id` is the leading column in all indexes, making a future switch to hash partitioning by tenant_id a non-breaking change.

`case_timeline` and `audit_log` (append-only, high volume) will be partitioned by range (monthly) from the start, as they have a clear time-based access pattern and no update workload.

## Consequences
- **Phase 3 load test** is the decision point. The test must measure inbox query latency, report query duration, and vacuum times at target volumes.
- The schema must be designed partition-ready: no cross-partition foreign keys that would prevent future partitioning, tenant_id in all indexes.
- Timeline and audit log are partitioned from day one to avoid retrofitting later.
