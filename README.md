# Dev-Claude-Skills

CodeNinja's private catalog of [Claude Code](https://code.claude.com/docs/en/skills) skills, shipped as a private npm package on GitHub Packages.

One command to browse and install skills into your Claude Code environment:

```bash
npx @codeninjainc/dev-claude-skills
```

You get an interactive picker — choose a stack (MERN, Next.js, Dev Tooling, Official Anthropic, Community), multi-select the skills you want, and they land in `~/.claude/skills/` (or `./.claude/skills/` with `--project`).

## What's inside

- `skills/official/` — mirror of [anthropics/skills](https://github.com/anthropics/skills)
- `skills/community/` — curated picks from [skills.sh](https://skills.sh) and vercel-labs
- `skills/patterns/mern/` — in-house MERN pattern skills
- `skills/patterns/devtools/` — husky + lint-staged + prettier bootstrapper, etc.

## Install the CLI

**One-time auth** — add a GitHub PAT with `read:packages` scope to `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=<YOUR_GH_PAT>
@codeninjainc:registry=https://npm.pkg.github.com
```

Then:

```bash
npx @codeninjainc/dev-claude-skills        # interactive picker
npx @codeninjainc/dev-claude-skills list   # show catalog
npx @codeninjainc/dev-claude-skills add react-component jwt-auth
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md). TL;DR:

1. Add a skill at `skills/patterns/<stack>/<name>/SKILL.md` (or a new source under `sources/`).
2. Open a PR — CI validates the frontmatter and lints the CLI.
3. Merge to `main` → pipeline publishes a new package version to GitHub Packages, org-wide.

## Pipeline

- **PR** → validate skills + lint + manifest check + diff comment.
- **Merge to main** → rebuild manifest, bump version, publish to GitHub Packages, Slack/Teams notify.
- **Weekly cron** → pull upstream skill updates from `anthropics/skills` / `skills.sh`, open auto-PR.

See [docs/PUBLISHING.md](docs/PUBLISHING.md) for the full flow.
