---
name: event-driven-architecture
description: Decouple producers from consumers via domain or integration events — in-process EventEmitter, message broker, or outbox pattern. Use when the user wants async workflows, cross-service communication, or mentions pub/sub, Kafka, RabbitMQ, or event sourcing.
tags: [architecture, events, pubsub, async]
version: 1.0.0
---

# event-driven-architecture

Publish events; let anyone interested subscribe.

## Decide the scope first

| Scope           | Tech                              | When                                                            |
| --------------- | --------------------------------- | --------------------------------------------------------------- |
| In-process      | Node EventEmitter, mitt           | Single service, same process, best-effort delivery OK           |
| Cross-service   | Kafka, RabbitMQ, SQS, NATS        | Multiple services, durable, ordered, at-least-once              |
| Durable + txnal | Outbox table + relay              | Must not lose events tied to a DB write                         |

## Produce (outbox pattern — the safe default for cross-service)

```
src/<feature>/
├── domain/events/OrderPlaced.ts    # event class/type
├── application/PlaceOrder.ts       # use-case: writes aggregate + outbox in ONE transaction
├── infrastructure/
│   ├── Outbox.ts                   # schema: id, type, payload, occurred_at, published_at
│   └── OutboxRelay.ts              # poller: SELECT unpublished → publish → mark published
```

## Event shape

```ts
{
  id: "uuid",
  type: "order.placed.v1",          // include version from day one
  aggregateId: "order_123",
  occurredAt: "2026-04-23T10:00:00Z",
  payload: { /* flat, serializable, no domain objects */ }
}
```

## Conventions

- **Events are past tense** (`OrderPlaced`, not `PlaceOrder` or `PlaceOrderCommand`).
- **Include a version in the type string** (`order.placed.v1`). You will need v2 one day.
- **Payload is a flat record of primitives** — no domain entity references, no Date objects (serialize to ISO strings).
- **Write aggregate + outbox in the same DB transaction.** Publishing to the broker is a separate step by the relay. This avoids "I wrote to DB but crashed before publishing".
- **Consumers must be idempotent.** At-least-once delivery means you will see the same event twice. Dedupe by `event.id`.
- **No RPC over events.** If the publisher needs a response, it's not an event — it's a command. Use a request/reply or HTTP call.
- **Don't put business logic in the broker layer** — subscribers dispatch to application services.

## Anti-patterns to refuse

- Synchronous waiting on an event (`await publish(...); await subscribe(...)`) — that's RPC with extra steps.
- Fat events with the entire aggregate embedded — slim payloads with IDs; consumers re-read if they need detail.
- One giant `DomainEvent` type with a `kind` field — use discriminated unions or a class per event.

## After writing

- Kill the relay mid-batch and restart it — confirm no events are lost and no duplicates land at the consumer (thanks to idempotency).
- Document the event schema somewhere consumers can discover it (schema registry, shared package, or README).
