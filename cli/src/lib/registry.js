/**
 * Loads the bundled registry/manifest.json produced by scripts/build-manifest.js.
 * Works both when running from source (../../../registry/manifest.json) and
 * when installed via npm (same relative path — skills/ and registry/ ship
 * alongside cli/ inside the tarball).
 */
const path = require('path');
const fs = require('fs');

let cached = null;

function findManifest() {
  const candidates = [
    path.resolve(__dirname, '../../../registry/manifest.json'),
    path.resolve(__dirname, '../../registry/manifest.json'),
    path.resolve(process.cwd(), 'registry/manifest.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `Could not locate registry/manifest.json. Tried:\n  ${candidates.join('\n  ')}`
  );
}

function findRepoRoot(manifestPath) {
  return path.dirname(path.dirname(manifestPath));
}

function load() {
  if (cached) return cached;
  const manifestPath = findManifest();
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  cached = {
    manifest,
    manifestPath,
    repoRoot: findRepoRoot(manifestPath),
  };
  return cached;
}

function skillAbsPath(skill) {
  const { repoRoot } = load();
  return path.join(repoRoot, skill.path);
}

function allSkills() {
  return load().manifest.skills;
}

function skillsByStack() {
  const groups = new Map();
  for (const s of allSkills()) {
    if (!groups.has(s.stack)) groups.set(s.stack, []);
    groups.get(s.stack).push(s);
  }
  return groups;
}

function findByName(name) {
  return allSkills().find((s) => s.name === name);
}

module.exports = { load, allSkills, skillsByStack, findByName, skillAbsPath };
