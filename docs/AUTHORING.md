# Authoring a skill

A skill is a folder containing a `SKILL.md` file. Claude Code reads the frontmatter to decide when to invoke it, then follows the markdown body as instructions.

## The minimum

```
skills/patterns/mern/my-skill/
└── SKILL.md
```

```markdown
---
name: my-skill
description: One paragraph describing WHEN Claude should invoke this skill. Use imperative phrases like "when the user asks to X" or "when you are about to Y" — these become the triggers.
tags: [optional, tags]
version: 1.0.0
---

# my-skill

What to do when invoked, in markdown.
```

## The rules

- **`name`** — lowercase, hyphens, matches the directory name.
- **`description`** — **the most important field**. Claude uses this to decide if the skill applies. Write it as trigger phrases, not a feature list.
- **`version`** — semver. Bump when behavior changes materially.
- **`tags`** — optional; used by the CLI's `search` and by stack filters.

## Anatomy of a good SKILL.md

Look at `skills/patterns/mern/express-route/SKILL.md` as a reference. It's structured as:

1. **Frontmatter** (name/description/tags/version).
2. **"Ask first"** — questions Claude should ask before acting (prevents blind scaffolding).
3. **"Produce"** — what files to create, with code templates inline.
4. **"Rules"** — invariants that must hold (status codes, error handling, naming).
5. **"After writing"** — verification and reporting.

This 4-section shape keeps Claude from going rogue and makes skills easy to review.

## Optional extras

```
skills/patterns/mern/my-skill/
├── SKILL.md
├── templates/            # files Claude should copy into the user's project
│   └── example.tsx
├── scripts/              # runnable helpers Claude can invoke
│   └── setup.sh
└── references/           # longer docs Claude can read as needed
    └── deep-dive.md
```

Reference these from SKILL.md so Claude knows when to use them.

## Worked example — `react-component`

1. Created `skills/patterns/mern/react-component/SKILL.md`.
2. Frontmatter:
   ```yaml
   name: react-component
   description: Scaffold a React functional component with hooks, PropTypes (or TS props), and a colocated test file. Use when the user asks to "create a component", "add a new React component", or drops a component spec.
   ```
   Note the explicit trigger phrases — that's what Claude's router matches on.
3. Body has four sections: Ask first / Produce / Conventions / After writing.
4. Ran `npm run validate` — green.
5. Ran `npm run manifest` — `registry/manifest.json` regenerated with the new entry.
6. Committed `skills/patterns/mern/react-component/` and `registry/manifest.json` together.

## Common pitfalls

- **Description too generic** — "Helps with React" is useless. Say what Claude should match on.
- **Too prescriptive** — don't hardcode file paths if they vary by project; tell Claude to detect.
- **Unsafe scripts** — never destructive without confirmation. `rm -rf` belongs nowhere near a SKILL.md.
- **Conflicting with existing skills** — before authoring, run `node cli/bin/ninja-skills.js search <topic>` to make sure there isn't already one.
