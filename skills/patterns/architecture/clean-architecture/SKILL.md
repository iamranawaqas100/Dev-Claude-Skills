---
name: clean-architecture
description: Apply Clean Architecture (Uncle Bob) — entities, use-cases, interface adapters, frameworks/drivers — with the Dependency Rule enforced by imports. Use when the user asks to "decouple from the framework", "make this testable", or mentions Clean/Hexagonal/Onion architecture.
tags: [architecture, clean, hexagonal, dependency-inversion]
version: 1.0.0
---

# clean-architecture

Lay out a codebase where the business rules don't know about the framework.

## The four concentric layers (inner ← depends ← outer)

```
┌─────────────────────────────────────────┐
│  Frameworks & Drivers                   │  Express, Next, Postgres driver, Redis
│  ┌───────────────────────────────────┐  │
│  │  Interface Adapters               │  │  controllers, presenters, gateways
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Use Cases                  │  │  │  application-specific business rules
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Entities             │  │  │  │  enterprise-wide business rules
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**The Dependency Rule**: source code dependencies point inward. Outer knows inner; inner knows *nothing* about outer.

## Produce

```
src/
├── entities/           # pure business objects, zero dependencies
├── use-cases/          # one file per use-case, takes ports as DI
│   └── ports/          # interfaces the use-case depends on (repo, notifier)
├── adapters/
│   ├── http/           # controllers: parse request → call use-case → format response
│   ├── repositories/   # implement use-cases/ports, use ORM/driver
│   └── external/       # HTTP clients to third parties
└── main/               # framework wiring: Express setup, DI container, app startup
```

## Conventions

- **Entities** are pure — no decorators, no framework types, testable without mocks.
- **Use-cases** receive dependencies via constructor or function args (ports). Never import a concrete repository — import the interface.
- **Adapters** translate between the outside world and the use-case's ports. Controllers are thin.
- **`main/`** is the *only* place that knows about Express, Next, Postgres. If you move to Fastify, only `main/` and `adapters/http/` change.
- A use-case unit test should require **zero** mocks for external systems — just hand it fake port implementations.

## Tell-tale violations

- `import express from 'express'` inside `use-cases/` → wrong layer.
- `@Entity()` decorators on domain models → ORM leakage, use a separate persistence model + mapper.
- Controllers with `if` branches on business rules → logic belongs in the use-case.

## After writing

- Grep the inner layers for outer imports:
  - `grep -r "from '.*adapters'" src/use-cases/` → should be empty
  - `grep -r "express\|next\|prisma" src/entities/ src/use-cases/` → should be empty
- Write one use-case test without any framework mock to prove testability.
