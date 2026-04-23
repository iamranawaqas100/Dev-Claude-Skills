#!/usr/bin/env node
/**
 * Read sources/sources.json, dispatch each enabled source to its adapter,
 * and write the resulting skills into the configured target directory.
 *
 * Usage:
 *   node scripts/sync-sources.js               # sync all enabled sources
 *   node scripts/sync-sources.js --only <id>   # sync a single source by id
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SOURCES_PATH = path.join(ROOT, 'sources', 'sources.json');
const ADAPTERS_DIR = path.join(ROOT, 'sources', 'adapters');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { only: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--only') out.only = args[++i];
  }
  return out;
}

async function main() {
  const { only } = parseArgs();
  const config = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));

  const summary = [];
  for (const source of config.sources) {
    if (!source.enabled) {
      console.log(`- [skip] ${source.id} (disabled)`);
      continue;
    }
    if (only && source.id !== only) continue;

    const adapterPath = path.join(ADAPTERS_DIR, `${source.adapter}.js`);
    if (!fs.existsSync(adapterPath)) {
      throw new Error(`Unknown adapter '${source.adapter}' for source '${source.id}'`);
    }
    const adapter = require(adapterPath);
    console.log(`\n→ syncing '${source.id}' via ${source.adapter} …`);
    const result = await adapter.sync(source, { repoRoot: ROOT });
    summary.push({ id: source.id, written: result.written.length });
    for (const p of result.written) console.log(`   + ${p}`);
  }

  console.log('\nSync summary:');
  for (const s of summary) console.log(`  ${s.id}: ${s.written} skill(s)`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
