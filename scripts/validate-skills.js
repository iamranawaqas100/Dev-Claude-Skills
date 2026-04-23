#!/usr/bin/env node
/**
 * Validate every SKILL.md under skills/ has the required frontmatter,
 * matches its directory name, and has a unique skill name globally.
 *
 * Exits 0 on success, 1 on any validation error.
 */
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const files = walk(SKILLS_DIR);
  const errors = [];
  const seenNames = new Map(); // name -> first file that declared it

  if (files.length === 0) {
    console.log('No SKILL.md files found yet — skipping validation.');
    return;
  }

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const raw = fs.readFileSync(file, 'utf8');
    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      errors.push(`${rel}: could not parse frontmatter: ${err.message}`);
      continue;
    }
    const fm = parsed.data || {};
    const dirName = path.basename(path.dirname(file));

    if (!fm.name) errors.push(`${rel}: missing required frontmatter field 'name'`);
    if (!fm.description) errors.push(`${rel}: missing required frontmatter field 'description'`);

    if (fm.name && !NAME_RE.test(fm.name)) {
      errors.push(`${rel}: name '${fm.name}' must be lowercase, digits and hyphens only`);
    }
    if (fm.name && fm.name !== dirName) {
      errors.push(`${rel}: name '${fm.name}' does not match directory '${dirName}'`);
    }
    if (fm.name) {
      if (seenNames.has(fm.name)) {
        errors.push(
          `${rel}: duplicate skill name '${fm.name}' (also at ${seenNames.get(fm.name)})`
        );
      } else {
        seenNames.set(fm.name, rel);
      }
    }
  }

  if (errors.length) {
    console.error(`✗ ${errors.length} validation error(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`✓ ${files.length} skill(s) validated.`);
}

main();
