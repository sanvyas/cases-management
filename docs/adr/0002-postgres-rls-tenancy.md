# ADR-0002: PostgreSQL Row-Level Security for Multi-Tenancy

## Status
Accepted

## Context
Samadhan is multi-tenant. Tenant data isolation is the most critical security requirement — a leak between tenants would be catastrophic. We need a tenancy strategy that is both secure and operationally simple.

Options considered:
1. **Database per tenant** — strongest isolation but operationally heavy (migrations, connection pools, monitoring multiply per tenant).
2. **Schema per tenant** — moderate isolation, same operational burden as database-per-tenant.
3. **Shared schema with application-level filtering** — simplest operations but isolation depends entirely on every query having the right WHERE clause.
4. **Shared schema with PostgreSQL RLS** — database-enforced isolation on a shared schema.

## Decision
We use **shared schema with PostgreSQL Row-Level Security (RLS)**.

Every tenant-scoped table has `tenant_id uuid NOT NULL` as the leading column in all indexes. RLS policies filter rows using `current_setting('app.tenant_id')::uuid`. The API sets session variables with `SET LOCAL` inside a transaction per request:
- `app.tenant_id` — the acting tenant
- `app.user_id` — the acting user
- `app.scope_nodes` — the user's node scope (array)
- `app.roles` — the user's roles

The application database role has **no** `BYPASSRLS`. Migrations and platform-level operations use separate database roles with elevated privileges.

For customers requiring dedicated resources (`dedicated_hosting` entitlement), a tenant registry maps tenant to a separate database/cluster. The same migrations and RLS policies apply.

## Consequences
- **Defence in depth:** even if application code has a bug and omits a tenant filter, RLS blocks cross-tenant access at the database level.
- **Testing:** every new table requires an RLS test (matrix of roles × own/other tenant × in/out of scope). The RLS test harness automates this.
- **Performance:** RLS adds a small overhead per query. The `tenant_id` leading-column convention ensures indexes support the filter efficiently.
- **Complexity:** `SET LOCAL` must happen in every request transaction. Forgetting it means zero rows returned (fail-safe). The middleware is a single point to get right and test thoroughly.
- **Platform operations:** platform-level queries (billing, support, metrics) require a separate role and audited code path.
