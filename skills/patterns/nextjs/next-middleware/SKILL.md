---
name: next-middleware
description: Author Next.js `middleware.ts` for auth gating, locale routing, A/B experiments, or header rewrites — with a tight matcher so it doesn't run on every request. Use when the user asks to "protect routes", "redirect based on cookie", or "rewrite URLs".
tags: [nextjs, middleware, auth, edge]
version: 1.0.0
---

# next-middleware

Create a narrow, matcher-scoped middleware.

## Ask first (if not already clear)

1. Which paths does this need to affect? (Never match everything — performance trap.)
2. Read-only (check auth → redirect) or rewriting (locale, A/B)?
3. Runtime: Edge (default) or Node? Edge is faster but has no `fs`/native modules.

## Produce

- `middleware.ts` at project root (or inside `src/`).
- Default-export a single function taking `NextRequest`.
- Export a `config.matcher` array listing only the paths that truly need this.

## Example shape

```ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

## Conventions

- **Never** put heavy logic (DB reads, JWT verification with big libs) in middleware — it runs on every matched request. Validate session cookies optimistically; full check happens in the route.
- Use `matcher` negation (`"/((?!api|_next/static|_next/image|favicon.ico).*)"`) only as a last resort — prefer explicit positive matchers.
- Don't import Node-only modules unless you've moved the middleware to the Node runtime (`export const runtime = 'nodejs'`).
- One `middleware.ts` per project; compose if-branches inside it, don't try to create multiple files.

## After writing

- Hit a matched path and an unmatched one — confirm middleware only fires on the matched path.
- Report which paths are protected and the redirect behavior.
