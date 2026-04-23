# Contributing to Dev-Claude-Skills

Thanks for adding to CodeNinja's Claude skill library. This guide is short on purpose — the pipeline does most of the work.

## TL;DR

```bash
git clone git@github.com:CodeNinjaInc/Dev-Claude-Skills.git
cd Dev-Claude-Skills
npm install

# author your skill under skills/patterns/<stack>/<name>/SKILL.md
npm run validate
npm run manifest

git add .
git commit -m "feat(skills): add <name>"
git push origin feat/<name>

# Open a PR. CI validates. Reviewer merges. Pipeline publishes.
```

## Where things go

| Kind of change                | Directory                                       |
| ----------------------------- | ----------------------------------------------- |
| Add a new pattern skill       | `skills/patterns/<stack>/<name>/SKILL.md`       |
| Add a new upstream source     | `sources/sources.json` + `sources/adapters/*`   |
| Change the CLI                | `cli/src/…`                                     |
| Change the validate/build     | `scripts/…`                                     |
| Edit upstream-synced skills   | **Don't** — fix at the source or override in `patterns/` |

## SKILL.md minimum

```markdown
---
name: my-skill           # lowercase, hyphens, matches folder name
description: When Claude should invoke this (one paragraph of triggers/use-cases)
tags: [optional, tags]
version: 1.0.0
---

# my-skill

Instructions to Claude in markdown.
```

Read [docs/AUTHORING.md](docs/AUTHORING.md) for a full worked example.

## Before pushing

```bash
npm run validate      # schema check
npm run manifest      # regenerate registry/manifest.json
npm run lint          # CLI + scripts lint
```

Husky runs prettier + eslint --fix on staged files automatically.

## Consuming the package (one-time setup)

Add to `~/.npmrc` a GitHub PAT with `read:packages` scope:

```
@codeninjainc:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<YOUR_GH_PAT>
```

Then `npx @codeninjainc/dev-claude-skills` works from any project.

## Questions?

See [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md) for the full tour.
