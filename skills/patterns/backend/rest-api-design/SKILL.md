---
name: rest-api-design
description: Design a RESTful HTTP API — resource-oriented URIs, correct verbs and status codes, consistent error envelope, pagination, and versioning. Use when the user is adding new endpoints, reviewing an API surface, or asks "what should this return?".
tags: [backend, rest, api, http]
version: 1.0.0
---

# rest-api-design

Design endpoints that behave predictably.

## URI shape

- **Nouns, not verbs**: `/orders`, not `/getOrders` or `/createOrder`.
- **Plural collections**: `/orders/123`, not `/order/123`.
- **Nest for ownership**, not relationships: `/orders/123/items` (items belong to order), but `/items?orderId=123` if items exist independently.
- **Kebab-case**: `/support-tickets`, not `/supportTickets` or `/support_tickets`.
- **Actions that aren't CRUD** get a sub-resource: `POST /orders/123/cancel`, not `POST /orders/123?action=cancel`.

## Verbs and status codes

| Verb   | Semantics                                  | Success                          |
| ------ | ------------------------------------------ | -------------------------------- |
| GET    | Read, safe, idempotent                     | 200 (found), 404 (not found)     |
| POST   | Create, **not** idempotent                 | 201 Created + `Location` header  |
| PUT    | Replace, idempotent                        | 200 or 204                       |
| PATCH  | Partial update                             | 200 or 204                       |
| DELETE | Remove, idempotent                         | 204 No Content                   |

**Key codes**: 400 (client validation failed), 401 (no auth), 403 (auth but forbidden), 404 (doesn't exist), 409 (conflict / version mismatch), 422 (semantically invalid), 429 (rate limit), 5xx (server's fault — include a request id).

## Error envelope (consistent across all endpoints)

```json
{
  "error": {
    "code": "order.not_found",
    "message": "Order 123 does not exist",
    "details": { "orderId": "123" },
    "requestId": "req_abc"
  }
}
```

## Pagination

- **Cursor-based** is the default for feeds: `?cursor=xyz&limit=20` → response `{ data, nextCursor }`.
- Offset-based (`?page=3&size=20`) is OK for small admin-facing lists.
- Return totals only when cheap — don't block the query on `COUNT(*)` across 10M rows.

## Versioning

- Pick **one** strategy and stick with it: URL (`/v1/orders`) or header (`Accept: application/vnd.codeninja.v1+json`). URL is simpler.
- Breaking changes → new version. Additive changes (new optional fields) do not.

## Conventions

- **ISO 8601 timestamps in UTC** — always. No Unix seconds, no locale-aware strings.
- **snake_case or camelCase** — pick one, enforce with a linter. Don't mix.
- **Filtering**: `?status=open&assignee=me`. No custom DSL.
- **Sparse fieldsets**: `?fields=id,title` if the resource is heavy.
- **Authenticate with Bearer tokens** (`Authorization: Bearer <jwt>`). Put API keys in headers, never query strings (they leak to logs).

## After writing

- Hit every status-code branch with curl; confirm the error envelope is consistent.
- Add one integration test per endpoint covering happy path + one failure.
