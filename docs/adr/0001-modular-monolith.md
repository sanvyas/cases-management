# ADR-0001: Modular Monolith Architecture

## Status
Accepted

## Context
Samadhan must serve Indian Municipal Corporations, Development Authorities, Zila Parishads and Gram Panchayats. Deployment targets range from managed Kubernetes clusters to a single VM in a state data centre. Customers require simple, self-hostable deployments with minimal operational complexity.

We need to choose between microservices, a modular monolith, or a traditional monolith.

## Decision
We adopt a **modular monolith** using NestJS with strict module boundaries.

The system consists of three separately deployable processes sharing one codebase:
1. **api** — NestJS REST API serving all HTTP traffic
2. **worker** — BullMQ job processors and schedulers
3. **voice-gateway** — WebSocket media stream service for phone calls

Business logic lives in `packages/domain` (pure TypeScript, no framework dependencies). NestJS modules align with bounded contexts (tenancy, auth, iam, cases, intake, messaging, etc.) and communicate through exported services or domain events only. ESLint boundary rules forbid cross-module deep imports.

## Consequences
- **Simple deployment:** 3 containers plus data services. Operators familiar with Docker Compose can run it.
- **Shared database:** all modules share one PostgreSQL instance (with RLS for tenancy). This simplifies transactions and avoids distributed data problems.
- **Future split path:** strict module boundaries allow extracting a module into a separate service later if load demands it, without a rewrite.
- **Single process limits:** the api process handles all HTTP traffic. Horizontal scaling is via replicas behind a load balancer, not per-module scaling. This is acceptable at the target scale (50 case creations/s, 2000 concurrent staff sessions).
- **Deployment coupling:** all modules deploy together. A change in one module requires redeploying the whole api. Acceptable for the team size and release cadence.
