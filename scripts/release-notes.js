#!/usr/bin/env node
/**
 * Diff the current manifest against the previous one (passed via CLI or env)
 * and emit a markdown changelog entry. Used by publish.yml to produce
 * release notes and Slack/Teams messages.
 *
 * Usage:
 *   node scripts/release-notes.js <old-manifest.json> <new-manifest.json>
 */
const fs = require('fs');

function load(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function diff(oldM, newM) {
  const oldBy = new Map(oldM.skills.map((s) => [s.id, s]));
  const newBy = new Map(newM.skills.map((s) => [s.id, s]));

  const added = [];
  const removed = [];
  const changed = [];

  for (const [id, s] of newBy) {
    if (!oldBy.has(id)) added.push(s);
    else if (JSON.stringify(oldBy.get(id)) !== JSON.stringify(s)) changed.push(s);
  }
  for (const [id, s] of oldBy) {
    if (!newBy.has(id)) removed.push(s);
  }
  return { added, removed, changed };
}

function main() {
  const [oldPath, newPath] = process.argv.slice(2);
  if (!oldPath || !newPath) {
    console.error('usage: release-notes.js <old.json> <new.json>');
    process.exit(2);
  }
  const { added, removed, changed } = diff(load(oldPath), load(newPath));

  const lines = [];
  if (added.length) {
    lines.push('### Added');
    for (const s of added) lines.push(`- \`${s.name}\` (${s.stack}) — ${s.description}`);
  }
  if (changed.length) {
    lines.push('\n### Updated');
    for (const s of changed) lines.push(`- \`${s.name}\` (${s.stack})`);
  }
  if (removed.length) {
    lines.push('\n### Removed');
    for (const s of removed) lines.push(`- \`${s.name}\` (${s.stack})`);
  }
  if (!lines.length) lines.push('_No skill changes in this release._');
  console.log(lines.join('\n'));
}

main();
