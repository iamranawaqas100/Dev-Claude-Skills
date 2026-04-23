<!-- Pick one section, delete the rest. -->

## New skill

- **Skill name**: `<name>` (matches directory)
- **Stack**: mern / next / devtools / other
- **What does it do?** (one paragraph)
- **When should Claude invoke it?** (trigger phrases — copy from SKILL.md `description`)

**Checklist**
- [ ] `skills/patterns/<stack>/<name>/SKILL.md` exists with valid frontmatter (`name`, `description`)
- [ ] Directory name matches `name` in frontmatter
- [ ] `npm run validate` passes locally
- [ ] `npm run manifest` run and `registry/manifest.json` committed
- [ ] No hardcoded paths to my machine in templates/scripts

---

## New upstream source ("perspective")

- **Source id**: `<id>`
- **Adapter**: existing (`github-repo`/`local`/`skills-sh`) or new
- **Target path**: `skills/community/<source>/`

**Checklist**
- [ ] Entry added to `sources/sources.json`
- [ ] Test-synced locally: `npm run sync -- --only <id>`
- [ ] Manifest rebuilt
- [ ] Licensing/attribution reviewed (upstream LICENSE preserved)

---

## CLI or infra change

- **Summary**:
- **Breaking?** yes / no (if yes, bump major via commit message `BREAKING CHANGE:`)

**Checklist**
- [ ] CLI smoke-tested: `node cli/bin/ninja-skills.js list`
- [ ] `npm run lint` clean
