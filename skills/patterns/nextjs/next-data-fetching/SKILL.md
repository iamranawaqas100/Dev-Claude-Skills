---
name: next-data-fetching
description: Choose and implement the right Next.js App Router data-fetching strategy — static, ISR, dynamic, streaming, or client-side — based on freshness and latency requirements. Use when the user asks "how should I fetch this data" or is picking between server/client data flows.
tags: [nextjs, data-fetching, caching, isr]
version: 1.0.0
---

# next-data-fetching

Pick the right fetching mode, then implement it cleanly.

## Decision tree

1. **Can the page be pre-rendered once per deploy?** → Static. Plain `async` page + `fetch(url)` (default cache: 'force-cache').
2. **Does it change every N seconds/minutes but is the same for all users?** → ISR. `fetch(url, { next: { revalidate: N } })`.
3. **Is it per-user or truly realtime?** → Dynamic. `fetch(url, { cache: 'no-store' })` or read cookies/headers.
4. **Is the first byte the bottleneck?** → Streaming. Wrap slow children in `<Suspense>` with a `loading.tsx`.
5. **Does it only matter after hydration (e.g. search-as-you-type)?** → Client fetch. Use SWR or React Query in a Client Component.

## Produce

- Inline `fetch()` in the Server Component for modes 1–3.
- `loading.tsx` + `<Suspense>` boundaries for mode 4.
- A `lib/fetcher.ts` + SWR/React Query provider for mode 5 (only add if the project doesn't already have one).

## Conventions

- **Never** mix `cache: 'no-store'` with `revalidate` — Next will warn and pick one.
- Tag mutations' related reads with `fetch(url, { next: { tags: ['posts'] } })` and invalidate from a Server Action via `revalidateTag('posts')`.
- Avoid waterfalls: if two fetches are independent, `await Promise.all([...])`.
- Never fetch the same resource in a parent and child — hoist to the lowest common ancestor and pass down.

## After writing

- Run `next build` and check the route type (`○ Static`, `ƒ Dynamic`, `● SSG`) matches intent.
- If ISR, note the revalidate interval in a comment so future maintainers don't tune it blindly.
