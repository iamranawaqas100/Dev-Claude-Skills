---
name: repository-pattern
description: Introduce the Repository pattern — an in-memory-like interface for a collection of domain objects that hides persistence details. Use when the user wants to decouple from the ORM, needs testable data access, or asks "where should DB queries live?".
tags: [architecture, repository, persistence, patterns]
version: 1.0.0
---

# repository-pattern

Separate what-you-ask-for from how-it's-stored.

## Ask first (if not already clear)

1. Which aggregate does this repository serve? (One repo per aggregate root — not one per table.)
2. What's the persistence tech? (Postgres via Prisma? Mongo via Mongoose? In-memory for tests?)

## Produce

```
src/<feature>/
├── domain/
│   ├── Order.ts                    # aggregate
│   └── OrderRepository.ts          # interface (the port)
└── infrastructure/
    ├── PrismaOrderRepository.ts    # implementation
    └── InMemoryOrderRepository.ts  # test double
```

## Interface shape

```ts
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  save(order: Order): Promise<void>;     // upsert semantics
  delete(id: OrderId): Promise<void>;
}
```

## Conventions

- **Returns aggregates, not rows or DTOs.** Map from persistence model → domain entity inside the repo.
- **Vocabulary matches the domain**: `findByActiveCustomer`, not `selectWhereStatusEq1`.
- **No leaky return types**: never return `Prisma.Order` — return the domain `Order`.
- **Save is idempotent**: `save(order)` handles both insert and update. Callers don't know or care.
- **One repository per aggregate**, not per table. A repo for `Order` owns lines, addresses, etc. — they're loaded/saved as a unit.
- **No query DSL leakage**: don't expose `.where(...)` or Prisma builders to callers. If you need flexible queries, add a named method.
- **Transactions live in application services**, not repositories — the repo exposes a unit-of-work or accepts a transaction context.

## Anti-patterns to refuse

- `GenericRepository<T>` with `find`, `findAll`, `update`, `delete` — it's an ORM with extra steps. Be specific.
- Repos that call other repos — leads to hidden load storms. Application services compose.
- `findByRawQuery(sql)` escape hatches — if you need raw SQL, that's a signal the repo's API is wrong.

## After writing

- Run the application services against `InMemoryOrderRepository` in tests — no DB needed.
- Confirm swapping `PrismaOrderRepository` → `MongoOrderRepository` requires no changes above the infrastructure layer.
