---
name: next-metadata
description: Add static or dynamic `generateMetadata` to a Next.js App Router page for SEO, Open Graph, Twitter cards, and canonical URLs. Use when the user asks about SEO, social previews, or fixing a page's title/description.
tags: [nextjs, seo, metadata, og]
version: 1.0.0
---

# next-metadata

Wire up page metadata for SEO and social.

## Static metadata

For routes where title/description don't depend on route params:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — CodeNinja",
  description: "Your team's workspace",
  openGraph: { title: "Dashboard", images: ["/og/dashboard.png"] },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/dashboard" },
};
```

## Dynamic metadata

For routes like `/posts/[slug]`:

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — Blog`,
    description: post.excerpt,
    openGraph: { images: [post.ogImage ?? "/og/default.png"] },
  };
}
```

## Conventions

- Put a default `metadata` in the root `app/layout.tsx` with a `title.template` (e.g. `%s — CodeNinja`) — per-page titles then only supply the `%s`.
- Use `app/<route>/opengraph-image.tsx` for dynamic OG images (Next's built-in `ImageResponse`).
- Don't duplicate `<meta>` tags in JSX — always use the Metadata API.
- Canonical URLs matter for duplicate content (filters, sort params) — set `alternates.canonical` deliberately.

## After writing

- Curl the page and inspect `<head>` for the generated tags.
- Paste the URL into a social debugger (e.g. `https://www.opengraph.xyz`) to verify the OG render.
