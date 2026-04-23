---
name: integration-test
description: Write an integration test that exercises multiple layers together — HTTP handler + service + real database (via testcontainers or a transaction per test). Use when the user asks to "test the API", "verify the DB writes", or needs confidence across a boundary.
tags: [testing, integration, supertest, testcontainers]
version: 1.0.0
---

# integration-test

Test the seams between layers, with real collaborators.

## Ask first (if not already clear)

1. What's the entry point? (HTTP handler, CLI command, queue consumer.)
2. What's the real dependency you want to exercise? (DB, Redis, external HTTP — usually just one.)
3. How is test data isolated? (Transaction per test / truncate between tests / testcontainers with fresh DB per file.)

## Produce

- `tests/integration/<feature>.test.ts`
- A `beforeAll` that boots the test dependency (testcontainer, in-memory server, etc.).
- A `beforeEach` that resets state — **transaction rollback** is fastest; truncation is the fallback.
- `afterAll` tear-down.

## Example (Express + Postgres via supertest + transaction-per-test)

```ts
import request from "supertest";
import { app } from "../../src/app";
import { db } from "../../src/db";

beforeEach(async () => {
  await db.query("BEGIN");
});
afterEach(async () => {
  await db.query("ROLLBACK");
});

describe("POST /orders", () => {
  it("creates an order and returns 201", async () => {
    const res = await request(app)
      .post("/orders")
      .send({ items: [{ sku: "A", qty: 2 }] })
      .expect(201);

    expect(res.body).toMatchObject({ id: expect.any(String), status: "pending" });
    const row = await db.query("SELECT * FROM orders WHERE id = $1", [res.body.id]);
    expect(row.rows[0].status).toBe("pending");
  });
});
```

## Conventions

- **Real dependency where possible.** A real Postgres via testcontainers catches more bugs than a mocked ORM.
- **Stub only what you don't own** (third-party HTTP APIs, email providers). Use `nock` or `msw`.
- **Transaction per test** is the fastest isolation — start a TX in `beforeEach`, roll back in `afterEach`. Requires all code under test to use the same connection/pool.
- **No shared fixtures across files** unless read-only. Mutable shared state causes order-dependent flakes.
- **Don't test every permutation here** — unit tests cover logic exhaustively; integration tests cover the critical paths.
- **Each integration test should finish in under 500ms.** If not, the setup is too heavy.

## Anti-patterns to refuse

- Mocking the DB in an integration test. If you're mocking everything, it's a unit test — name it that.
- Sleeping to wait for async work (`await sleep(100)`). Use event-based waits or poll with a timeout.
- Letting tests talk to a shared staging DB. Flakes guaranteed.

## After writing

- Run in isolation and in parallel with other files — if order matters, isolation is broken.
- Confirm test teardown: no orphan rows in the DB after the suite.
