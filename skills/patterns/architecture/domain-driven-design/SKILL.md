---
name: domain-driven-design
description: Structure a feature using Domain-Driven Design — entities, value objects, aggregates, repositories, and application services — with a clean boundary between the domain and infrastructure. Use when the user asks to "model this properly", designs a complex business feature, or mentions DDD, aggregates, or bounded contexts.
tags: [architecture, ddd, domain-modeling, patterns]
version: 1.0.0
---

# domain-driven-design

Lay out a feature in DDD layers.

## Ask first (if not already clear)

1. What is the **ubiquitous language**? (The terms the business uses — use these verbatim in code.)
2. What is the **aggregate root**? (The entity that owns the invariants.)
3. What are the **invariants**? (Rules that must hold — e.g. "order total matches sum of line items".)

## Produce (per bounded context)

```
src/contexts/<name>/
├── domain/
│   ├── entities/        # identity + behavior
│   ├── value-objects/   # immutable, equality by value
│   ├── aggregates/      # consistency boundary + root
│   ├── events/          # domain events (past tense)
│   └── repositories/    # interfaces only
├── application/
│   ├── commands/        # write use-cases
│   ├── queries/         # read use-cases (can bypass domain, read projections)
│   └── services/        # orchestration across aggregates
└── infrastructure/
    ├── persistence/     # repository implementations
    └── adapters/        # external services
```

## Conventions

- **Entities** have identity and mutable state; equality by ID, not value.
- **Value objects** are immutable; equality by value; no ID. Money, Email, Address, DateRange.
- **Aggregate root** is the only entry point to mutate an aggregate — enforce invariants in its methods, never let callers mutate internals directly.
- **Repositories** return aggregates, not DTOs. Interface in `domain/`, implementation in `infrastructure/`.
- **Domain events** are past tense (`OrderPlaced`, not `PlaceOrder`) and published after invariants are checked.
- Domain layer has **zero imports** from infrastructure or frameworks. If you need to reach for ORM or HTTP, you're in the wrong layer.
- Application services are thin: load aggregate → call a method on it → persist → publish events. No business rules here.

## Anti-patterns to refuse

- Anemic models (entities that are just getters/setters + services full of logic) — push behavior into the entity.
- Cross-aggregate transactions — use eventual consistency via domain events instead.
- Leaking ORM types into the domain (e.g. `@Entity` decorators on domain classes) — use a mapper.

## After writing

- Confirm the domain folder has no imports from `infrastructure/` or any framework.
- Identify the aggregate roots in a short note at the top of the context folder.
