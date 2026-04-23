#!/usr/bin/env node
/**
 * Scan skills/ for SKILL.md files, read their frontmatter, and emit
 * registry/manifest.json — the catalog the CLI consumes.
 *
 * Usage:
 *   node scripts/build-manifest.js          # write manifest
 *   node scripts/build-manifest.js --check  # fail if manifest would differ from disk
 */
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MANIFEST_PATH = path.join(ROOT, 'registry', 'manifest.json');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name === 'SKILL.md') out.push(full);
  }
  return out;
}

/**
 * Derive (stack, source) from the path under skills/.
 *   skills/official/docx/SKILL.md                → { source: 'official', stack: 'official' }
 *   skills/community/<source>/<name>/SKILL.md    → { source: <source>, stack: 'community' }
 *   skills/patterns/<stack>/<name>/SKILL.md      → { source: 'codeninja-internal', stack: <stack> }
 */
function classify(skillMdPath) {
  const rel = path.relative(SKILLS_DIR, skillMdPath).split(path.sep);
  // rel example: ['patterns', 'mern', 'react-component', 'SKILL.md']
  const top = rel[0];
  if (top === 'official') {
    return { source: 'anthropic-official', stack: 'official' };
  }
  if (top === 'community') {
    return { source: rel[1] || 'community', stack: 'community' };
  }
  if (top === 'patterns') {
    return { source: 'codeninja-internal', stack: rel[1] || 'misc' };
  }
  return { source: 'unknown', stack: 'misc' };
}

function buildManifest() {
  const files = walk(SKILLS_DIR).sort();
  const entries = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const fm = matter(raw).data || {};
    const dir = path.dirname(file);
    const { source, stack } = classify(file);
    const name = fm.name || path.basename(dir);
    entries.push({
      id: `${stack}/${name}`,
      name,
      description: fm.description || '',
      stack,
      source,
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      version: fm.version || '1.0.0',
      path: path.relative(ROOT, dir).split(path.sep).join('/'),
    });
  }
  return {
    generatedAt: new Date().toISOString(),
    count: entries.length,
    skills: entries,
  };
}

function main() {
  const check = process.argv.includes('--check');
  const next = buildManifest();
  const nextJson = JSON.stringify(next, null, 2) + '\n';

  if (check) {
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.error('✗ registry/manifest.json does not exist — run `npm run manifest`');
      process.exit(1);
    }
    const current = fs.readFileSync(MANIFEST_PATH, 'utf8');
    // Ignore generatedAt drift on check
    const strip = (s) => s.replace(/"generatedAt":\s*"[^"]*",?\s*/, '');
    if (strip(current) !== strip(nextJson)) {
      console.error('✗ registry/manifest.json is stale — run `npm run manifest`');
      process.exit(1);
    }
    console.log(`✓ manifest is up-to-date (${next.count} skills).`);
    return;
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, nextJson);
  console.log(`✓ Wrote ${next.count} skills to registry/manifest.json`);
}

main();
