---
name: next-server-component
description: Build a Next.js App Router Server Component that fetches data at the server, streams to the client, and avoids accidental "use client" boundaries. Use when the user asks to add a page/route under `app/`, or converts a client component to a server one.
tags: [nextjs, app-router, rsc, server-component]
version: 1.0.0
---

# next-server-component

Scaffold a React Server Component under the Next.js App Router.

## Ask first (if not already clear)

1. Route path (e.g. `app/dashboard/page.tsx`).
2. Data source (DB query, REST, GraphQL)?
3. Does it need interactivity? If yes, isolate that to a child Client Component — do not escalate the whole file with `"use client"`.

## Produce

- `app/<route>/page.tsx` — async function component, typed props.
- `app/<route>/loading.tsx` — Suspense fallback (skeleton).
- `app/<route>/error.tsx` — error boundary (must be Client Component, one line `"use client"` at top).
- If interactivity is needed: `app/<route>/<Interactive>.client.tsx` with the `"use client"` directive, imported from the server page.

## Conventions

- Server components fetch directly: `const data = await db.foo.findMany()` — no `useEffect`, no SWR, no React Query on the server.
- Cache with `fetch(url, { next: { revalidate: N } })` or `unstable_cache`. Never `cache: "no-store"` unless truly dynamic.
- Mark interactive leaves with `"use client"` at the smallest possible boundary.
- Never import server-only code (DB drivers, secrets) from a Client Component — use a Server Action instead.

## After writing

- Run `next build` and confirm the route compiles as `○` (static) or `λ` (dynamic) as intended.
- Report the route path and whether it's static/dynamic/ISR.
