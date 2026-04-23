---
name: atomic-design
description: Organize frontend components in Atomic Design layers — atoms, molecules, organisms, templates, pages. Use when the user is setting up a component library, asks about "component hierarchy", or wants to split a monolithic component.
tags: [architecture, frontend, components, design-system]
version: 1.0.0
---

# atomic-design

Apply Brad Frost's Atomic Design to a React/Next component tree.

## The five layers

| Layer      | What it is                                  | Examples                            |
| ---------- | ------------------------------------------- | ----------------------------------- |
| Atoms      | Smallest meaningful UI element, no children | Button, Input, Label, Icon          |
| Molecules  | Small group of atoms with one job           | SearchBox (Input + Button), FormField (Label + Input + Error) |
| Organisms  | Composed sections of a page                 | Header, ProductCard, CommentThread  |
| Templates  | Page layout, no real data                   | DashboardLayout, CheckoutLayout     |
| Pages      | Template + real data                        | `/dashboard`, `/checkout/[id]`      |

## Produce

```
src/components/
├── atoms/<Name>/
├── molecules/<Name>/
├── organisms/<Name>/
├── templates/<Name>/
└── (pages live in app/ or pages/, not here)
```

Each component folder: `<Name>.tsx`, `<Name>.test.tsx`, optional `<Name>.stories.tsx`, `index.ts`.

## Conventions

- **Lower layers never import higher layers.** Atoms don't import Molecules. If you're tempted — extract the shared bit down to atoms.
- Atoms are **visually styled but logic-free** — no data fetching, no business rules, no context reads.
- Molecules own **local state** only (input value, open/closed). Never global state.
- Organisms can read context and dispatch actions — this is where "app-aware" composition lives.
- Templates receive data via props and slots — never fetch themselves.
- Don't over-atomize: if a button only appears once and won't be reused, a plain JSX `<button>` inline is fine. Atoms exist to be shared.

## When to refuse this structure

- Small app (< 30 components) — flat `components/` is fine, atomic adds overhead.
- Team dislikes the naming — layering by responsibility (`ui/`, `forms/`, `layout/`) is equivalent.

## After writing

- Scan for import violations (`grep "from '.*/molecules'" src/components/atoms/` should return nothing).
- Consider a Storybook build for the atoms/molecules tier.
