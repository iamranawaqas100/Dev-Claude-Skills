# Publishing

How `@codeninjainc/dev-claude-skills` reaches developers.

## The pipeline

```
PR opened                        → ci.yml validates
PR merged to main                → publish.yml ships
Weekly Mon 09:00 UTC             → sync.yml opens a sync PR
```

## What `publish.yml` does, step by step

1. Snapshots the current `registry/manifest.json` for diffing.
2. `npm run manifest` — rebuilds from source of truth.
3. `npm version patch` — bumps patch (e.g. 0.1.0 → 0.1.1) and creates a git tag.
4. Pushes the version bump + manifest back to `main` with `[skip ci]` so we don't loop.
5. `scripts/release-notes.js` — diffs old vs. new manifest, emits a changelog.
6. `npm publish` — pushes to GitHub Packages (`https://npm.pkg.github.com`).
7. Creates a GitHub Release with the changelog.
8. (Optional) Posts to Slack if `SLACK_WEBHOOK_URL` secret is set.

## Version strategy

- **patch** (0.1.x) — default, for new skills / minor tweaks.
- **minor** (0.x.0) — new upstream source added, or new CLI feature.
- **major** (x.0.0) — breaking CLI change.

To force a minor/major bump, edit `cli/package.json` manually in the merge commit or prefix the commit message with `feat!:` / `BREAKING CHANGE:` (the workflow can be extended to read this).

## Auth

The workflow uses the default `GITHUB_TOKEN` with:
- `contents: write` — to commit the version bump back
- `packages: write` — to publish

No separate PAT needed.

## Cutting a manual release

```bash
git checkout main && git pull
npm run manifest
npm version minor            # or major
git push origin main --follow-tags
```

Then trigger `publish.yml` manually via the Actions tab, or push a dummy commit.

## Yanking a bad version

```bash
npm unpublish @codeninjainc/dev-claude-skills@x.y.z --registry=https://npm.pkg.github.com
```

npm has a 72-hour unpublish window. After that, use `npm deprecate` instead:

```bash
npm deprecate @codeninjainc/dev-claude-skills@x.y.z "Reason — use x.y.z+1" \
  --registry=https://npm.pkg.github.com
```

## Consumer auth

Every CodeNinja dev needs `~/.npmrc`:

```
@codeninjainc:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<PAT with read:packages>
```

Document this once in onboarding and forget about it.
