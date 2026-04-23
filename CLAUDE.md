# CLAUDE.md — Dev-Claude-Skills repo

This repo is a catalog of Claude Code skills published as a private npm package (`@codeninjainc/dev-claude-skills`) on GitHub Packages. When working here, follow these rules.

## Layout

- `skills/` — the actual skills (the product)
  - `skills/official/` — mirrored from `anthropics/skills` (do not hand-edit; re-sync via `npm run sync`)
  - `skills/community/<source>/` — mirrored from external sources (also synced)
  - `skills/patterns/<stack>/<name>/` — in-house, hand-authored skills
- `cli/` — the distribution CLI (`ninja-skills`)
- `sources/` — source adapters and `sources.json` config for upstream syncs
- `scripts/` — tooling (validator, manifest builder, source sync, release notes)
- `registry/manifest.json` — generated, checked in, consumed by the CLI

## Rules for changes

1. **Never hand-edit `registry/manifest.json`** — run `npm run manifest`.
2. **Never hand-edit files under `skills/official/` or `skills/community/`** — those come from upstream syncs. Fix at the source or override by adding a pattern skill.
3. **New skills go under `skills/patterns/<stack>/<name>/`** and must have a valid `SKILL.md` frontmatter (`name`, `description` required).
4. **The CLI (`cli/`) should never require network access at runtime** — skills must travel inside the npm tarball.
5. **Match the existing patterns** when adding a new adapter in `sources/adapters/`: one file, one exported `async sync(config)` function that returns `{ written: string[] }`.

## Before committing

- `npm run validate` — frontmatter schema check
- `npm run manifest` — regenerate manifest
- `npm run lint` — eslint on CLI/scripts
- Husky + lint-staged runs prettier + eslint --fix on staged files automatically.

## Adding a new skill (happy path)

```
mkdir -p skills/patterns/mern/my-skill
# Write SKILL.md with name + description frontmatter
npm run validate
npm run manifest
git add skills/patterns/mern/my-skill registry/manifest.json
git commit
```

## Adding a new upstream source ("perspective")

1. Add an entry to `sources/sources.json`.
2. If you need a new adapter, drop a file in `sources/adapters/<kind>.js` exporting `async sync(config)`.
3. Run `npm run sync` — verify the new skills land in the expected `target` dir.
4. Run `npm run manifest` and commit.

See `docs/NEW-SOURCE.md` for a full walkthrough.
