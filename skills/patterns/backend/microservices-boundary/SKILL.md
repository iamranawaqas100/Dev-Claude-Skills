---
name: microservices-boundary
description: Decide where to draw a service boundary — by bounded context, data ownership, and rate of change — before splitting a monolith or adding a new service. Use when the user asks "should this be a separate service?", is considering extracting code, or designing a new feature.
tags: [architecture, microservices, backend, boundaries]
version: 1.0.0
---

# microservices-boundary

Split services for good reasons, not because "microservices".

## The three axes

1. **Bounded context** (DDD): does it speak a different language from the rest? (`Billing` vs `Inventory` — different invariants, different stakeholders.)
2. **Data ownership**: does it own a cluster of tables no one else should write to?
3. **Rate and independence of change**: does it deploy on a different cadence than its neighbors? Can a team own it end-to-end?

**All three aligned → strong candidate for a service.**
**Only one aligned → probably a module, not a service.**

## Red flags that you're splitting wrong

- Two services share a database. → Not independent; merge or own the schema from one side.
- A feature requires a synchronous chain of 4+ service calls. → Distributed monolith; collapse the chain.
- You need distributed transactions or two-phase commit. → The boundary is wrong. Move data or switch to eventual consistency via events.
- Every deploy of service A requires a coordinated deploy of service B. → They're coupled; they should be one service.
- The service has one endpoint that's just a proxy to another service. → Pointless hop.

## When to stay a monolith (or modular monolith)

- Team size < 10 engineers.
- Domain not yet stable — you don't know the bounded contexts.
- Observability, CI/CD, and on-call are weak. Microservices amplify operational immaturity.

## If you do split: the contract

- **Own your data**. No other service reads your DB directly. Expose it through an API or events.
- **Backward-compatible API changes**. Version events and endpoints. Never break consumers.
- **Async by default**. Synchronous RPC between services is a latency multiplier and a coupling trap.
- **Own your on-call**. If team A wakes up when team B's service fails, the boundary is organizational, not just technical.
- **Service template**: each service has the same scaffolding (logging, tracing, health, deploy). Deviations need a reason.

## Heuristics

- **"Two pizza team" rule**: a service should fit in one team's head.
- **"Change together, ship together"**: code that always changes in lockstep belongs in one service.
- **"Data gravity"**: whoever writes the data should own the service that serves it.

## After writing

- Draw the service map: boxes (services) + arrows (calls/events). If it looks like a hairball, you've over-split.
- For every arrow, name the failure mode: "if this call times out, what does the caller do?" No answer → fix before shipping.
