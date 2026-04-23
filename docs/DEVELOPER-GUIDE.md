# Developer guide

Everything a contributor needs to improve Dev-Claude-Skills, in one page.

## Mental model

```
┌─────────────────────────────┐
│   Dev-Claude-Skills (repo)  │
│                             │
│  skills/  ←  the product    │
│  cli/     ←  delivery       │
│  sources/ ←  pluggable pulls│
│  scripts/ ←  validation     │
│  .github/ ←  pipeline       │
└─────────────────────────────┘
        │
        │  merge to main → publish.yml
        ▼
┌──────────────────────────────────────┐
│  GitHub Packages (private, org-wide) │
│  @codeninjainc/dev-claude-skills     │
└──────────────────────────────────────┘
        │
        │  npx @codeninjainc/dev-claude-skills
        ▼
┌──────────────────────────────────────┐
│  Developer's machine                 │
│  interactive picker → ~/.claude/skills│
└──────────────────────────────────────┘
```

## Three ways to contribute

1. **Add a pattern skill** → [AUTHORING.md](AUTHORING.md)
2. **Add a new upstream source** (perspective) → [NEW-SOURCE.md](NEW-SOURCE.md)
3. **Improve the CLI** → edit `cli/src/` and open a PR

## Local dev loop

```bash
npm install

# Make changes
npm run validate        # schema check
npm run manifest        # regenerate registry/manifest.json
node cli/bin/ninja-skills.js list
node cli/bin/ninja-skills.js --target ./tmp-test   # interactive dry run
```

## Release pipeline in one picture

```
PR opened
  ├─ ci.yml: validate + manifest:check + lint  (must be green)
  └─ review by CODEOWNERS

Merge to main
  ├─ publish.yml:
  │    ├─ rebuild manifest
  │    ├─ npm version patch
  │    ├─ commit [skip ci] back to main
  │    ├─ npm publish → GitHub Packages
  │    ├─ create GitHub Release with changelog
  │    └─ Slack notification (if SLACK_WEBHOOK_URL set)
  └─ every CodeNinja dev picks up the new version on next `npx`
```

## Weekly upstream sync

`sync.yml` runs Mondays at 09:00 UTC — pulls latest from enabled `sources.json` entries and opens a PR if anything changed. A human reviews + merges, then `publish.yml` ships it.

Trigger it manually any time via the Actions tab (`Run workflow`).

## Anti-patterns

| Don't                                             | Do                                                         |
| ------------------------------------------------- | ---------------------------------------------------------- |
| Hand-edit `skills/official/` or `skills/community/` | Re-run `npm run sync`, or override in `skills/patterns/` |
| Hand-edit `registry/manifest.json`                | Run `npm run manifest`                                     |
| Add a skill that duplicates an official one       | Use the official one, or justify why a CodeNinja variant   |
| Ship secrets in a skill template                  | Use placeholders; document env vars in SKILL.md            |
| Force-push to main                                | Open a revert PR; pipeline will re-publish                 |

## Debugging

- **CLI can't find manifest** → run `npm run manifest` from repo root.
- **Validator says duplicate name** → two skills have the same `name` in frontmatter. Rename one.
- **Publish failed "403 forbidden"** → the `GITHUB_TOKEN` needs `packages:write`. Check the workflow's `permissions` block.
- **Sync didn't pick up a new source** → `enabled: true`? Adapter file exists under `sources/adapters/`?
