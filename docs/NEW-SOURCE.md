# Adding a new upstream source ("perspective")

A **source** is any external place we pull skills from — an Anthropic repo, a community marketplace, an internal GitLab mirror. Each source is a declarative entry in `sources/sources.json` plus (optionally) a small adapter under `sources/adapters/`.

## Case 1: the source is a public GitHub repo

No new code needed — just add an entry.

```json
{
  "id": "awesome-python-skills",
  "adapter": "github-repo",
  "repo": "someone/awesome-python-skills",
  "branch": "main",
  "subdir": "skills",
  "target": "skills/community/awesome-python-skills",
  "enabled": true,
  "notes": "Curated Python skills from <author>."
}
```

Then:

```bash
npm run sync -- --only awesome-python-skills
npm run manifest
git add .
git commit -m "feat(sources): add awesome-python-skills"
```

The `github-repo` adapter will:
1. Shallow-clone the repo.
2. Walk `subdir` for `SKILL.md` files.
3. Copy each containing folder into `target/<skill-name>/`.
4. Drop an `ATTRIBUTION.md` breadcrumb in each skill.
5. Preserve upstream `LICENSE`/`NOTICE` as `UPSTREAM_LICENSE` / `UPSTREAM_NOTICE`.

## Case 2: the source is not a GitHub repo

Write an adapter. One file, one exported function:

```js
// sources/adapters/my-source.js
async function sync(config, { repoRoot }) {
  // 1. Fetch skills from wherever (HTTP API, internal registry, S3, …)
  // 2. Write each SKILL.md into `config.target/<name>/`
  // 3. Return { written: [<relative paths>] }
  return { written: [] };
}

module.exports = { sync };
```

Then add to `sources.json`:

```json
{
  "id": "my-source",
  "adapter": "my-source",
  "target": "skills/community/my-source",
  "enabled": true
}
```

Any extra fields on the entry (filter, url, token env var, etc.) are passed through to your adapter as `config`.

## Testing an adapter

```bash
npm run sync -- --only my-source
```

Then inspect `skills/community/my-source/` to see what was written.

## Licensing checklist (required)

Before enabling a new source:

- [ ] Check upstream LICENSE — is redistribution allowed?
- [ ] Attribution written automatically by adapter? (`ATTRIBUTION.md` per skill)
- [ ] Any skill that embeds third-party code has its license noted in its SKILL.md
- [ ] Root `NOTICE` file updated if the source is copyleft

## A worked example

Look at `sources/adapters/github-repo.js` — it's ~70 lines and handles 90% of cases. Use it as your template.
