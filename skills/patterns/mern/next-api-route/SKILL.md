---
name: next-api-route
description: Create a Next.js App Router API route (route.ts) or legacy pages/api handler, with input parsing, error handling, and correct status codes. Use when the user asks to "add an API route" in a Next.js project.
tags: [next, api, app-router, backend]
version: 1.0.0
---

# next-api-route

Scaffold a Next.js API route matching the project's router style.

## Ask first

1. App Router (`app/**/route.ts`) or Pages Router (`pages/api/**`)? Detect by looking for `app/` or `pages/api/` — confirm if ambiguous.
2. Path and methods (e.g. `POST /api/users`, `GET /api/users/[id]`).
3. Request body validation — zod if installed, else raw parsing with a TODO.

## Produce (App Router)

`app/api/<path>/route.ts`:

```ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // validate
    // do work
    return NextResponse.json({ /* ... */ }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Produce (Pages Router)

`pages/api/<path>.ts`:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try { /* ... */ } catch (err) { res.status(500).json({ error: 'Internal error' }); }
}
```

## Rules

- Never leak stack traces to the client.
- Dynamic segments use `[id]` — mirror existing project naming.
- For App Router, use one exported function per method (GET, POST, etc.) — don't switch on `req.method`.
- If the project has middleware (`middleware.ts`), don't duplicate auth checks inside the handler.
