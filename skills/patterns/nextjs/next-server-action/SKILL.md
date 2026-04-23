---
name: next-server-action
description: Implement a Next.js Server Action for form submission or mutation — typed input with Zod, error surfacing, revalidation, and redirect. Use when the user asks to "add a form", "handle submit on the server", or replaces an API route with a Server Action.
tags: [nextjs, server-action, mutation, forms]
version: 1.0.0
---

# next-server-action

Create a typed, validated Server Action.

## Ask first (if not already clear)

1. What mutation? (create, update, delete, ...)
2. Redirect target after success? (usually back to the list page.)
3. Which cache tag(s) should invalidate?

## Produce

- `app/<route>/actions.ts` with `"use server"` at top.
- Export a single async function taking a typed payload or `FormData`.
- Use Zod (or existing project validator) for input validation.
- On success: `revalidateTag(...)` or `revalidatePath(...)`, then `redirect(...)` if navigating.
- Return `{ ok: true }` or `{ ok: false, error }` for inline-error forms (useFormState).

## Example shape

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreatePostSchema = z.object({ title: z.string().min(1), body: z.string() });

export async function createPost(_prev: unknown, formData: FormData) {
  const parsed = CreatePostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  await db.post.create({ data: parsed.data });
  revalidatePath("/posts");
  redirect("/posts");
}
```

## Conventions

- **Never** call a Server Action from another Server Action by import — compose at the caller (page/route handler).
- Authorization check is the **first** line of the action body after validation. Don't delegate auth to the DB layer.
- Don't throw for expected failures (validation, unauthorized) — return a result object. Throw only for truly exceptional errors.
- `useFormState` + `useFormStatus` is the idiomatic form wiring on the client.

## After writing

- Test: submit the form in dev, confirm the redirect + cache invalidation fire.
- Report the action name and which pages it revalidates.
