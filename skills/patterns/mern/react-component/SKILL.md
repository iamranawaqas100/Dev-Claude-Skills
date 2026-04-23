---
name: react-component
description: Scaffold a React functional component with hooks, PropTypes (or TS props), and a colocated test file. Use when the user asks to "create a component", "add a new React component", or drops a component spec.
tags: [react, frontend, component, mern]
version: 1.0.0
---

# react-component

When invoked, scaffold a new React functional component following CodeNinja conventions.

## Ask first (if not already clear)

1. Component name (PascalCase).
2. Target directory (default: `src/components/<Name>/`).
3. TypeScript or JavaScript?
4. Styled with Tailwind, CSS modules, or plain CSS?
5. Needs state/effects, or pure presentational?

## Produce

Create these files in the target directory:

- `<Name>.tsx` (or `.jsx`) — functional component using hooks, default-exported.
- `<Name>.module.css` (only if CSS modules was chosen).
- `<Name>.test.tsx` (or `.test.jsx`) — one render test using React Testing Library.
- `index.ts` (or `index.js`) — re-export the default.

## Conventions

- Prefer named props via destructuring at the top of the function.
- For TS: define a `Props` interface in the same file unless it's large (>10 fields), then extract.
- No class components.
- If the user already uses a components folder structure (check siblings), match it — do not impose the `<Name>/` subfolder layout if the project uses flat files.
- Don't add a barrel `index` if the project's other components don't have one.

## After writing

- Run the project's test command for just the new file if you can identify it (`npm test -- <Name>`).
- Report the paths you created and how to import: `import <Name> from '<path>'`.
