---
name: caching-strategy
description: Pick and implement the right cache layer — HTTP, CDN, in-process, Redis — with correct TTLs, invalidation, and stampede protection. Use when the user asks to "make this faster", "cache this response", or mentions Redis/Memcached/ETags.
tags: [backend, caching, redis, performance]
version: 1.0.0
---

# caching-strategy

Cache where it pays off, invalidate honestly.

## Decision: where to cache

1. **HTTP / CDN** (Cloudflare, Vercel edge) — for public, GET-able resources shared across users. Use `Cache-Control: public, max-age=..., stale-while-revalidate=...`.
2. **In-process (Node LRU)** — per-instance memoization of pure computations or slow-changing lookups. Cheap, but doesn't share across replicas.
3. **Redis / Memcached** — shared across replicas, survives restarts, supports pub/sub invalidation. The default for server-side caches.
4. **Database materialized views** — for expensive analytic joins. Cache rebuild on a schedule.

## Patterns

### Cache-aside (the default)

```ts
async function getOrder(id: string) {
  const cached = await redis.get(`order:${id}`);
  if (cached) return JSON.parse(cached);
  const order = await db.order.findUnique({ where: { id } });
  await redis.set(`order:${id}`, JSON.stringify(order), "EX", 300);
  return order;
}
```

### Write-through (consistent cache)

On write: update DB *and* cache in the same path. Use when reads vastly outnumber writes and staleness is unacceptable.

### Stampede protection (singleflight)

If 1000 requests miss the cache simultaneously, don't hammer the DB 1000 times. Lock the key briefly, let one request fill, others wait.

## Invalidation

- **Event-based**: on write, `DEL cache:<key>` (or publish invalidation event). Best when writes are identifiable.
- **TTL-based**: set a short TTL and accept brief staleness. Simple and good enough for most.
- **Tag-based**: group keys under a tag, bump a version number to invalidate all at once (Next.js `revalidateTag` model).

## Conventions

- **Key naming**: `<domain>:<type>:<id>` — `orders:byId:123`, `users:session:abc`. Prefix namespaces so `FLUSHDB` is never tempting.
- **Always set a TTL** — even for "permanent" data, 24h cap prevents runaway memory.
- **Serialize once**: JSON.stringify on write, parse on read. Don't leak Redis-specific types.
- **Never cache authenticated responses in a CDN** without `Cache-Control: private`.
- **Return the cached-vs-fresh state** in debug headers (`X-Cache: HIT|MISS`) so you can verify in prod.

## Anti-patterns to refuse

- Caching writes or non-idempotent GETs (`/orders?search=` with per-user result) without a user-scoped key.
- `KEYS *` in production — it blocks Redis. Use `SCAN`.
- Caching a value that is *sometimes* null and *sometimes* a real object with the same key shape → null-poisoning. Cache a sentinel or a typed envelope.

## After writing

- Load-test the endpoint with cache cold vs. warm; confirm the hit ratio in Redis INFO.
- Pull the plug on Redis (or set it to readonly) and confirm the app degrades gracefully, not crashes.
