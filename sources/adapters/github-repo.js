/**
 * github-repo adapter
 *
 * Clones a GitHub repo (shallow), walks it for SKILL.md files, and copies
 * each containing directory into `target/<skill-name>/`.
 *
 * config: { repo: 'owner/name', branch?: 'main', subdir?: '.', target: 'skills/...' }
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function walkForSkills(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === 'SKILL.md') out.push(dir);
    else if (entry.isDirectory()) out.push(...walkForSkills(full));
  }
  return out;
}

async function sync(config, { repoRoot }) {
  const { repo, branch = 'main', subdir = '.', target, id } = config;
  const cloneDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dcs-clone-'));
  const url = `https://github.com/${repo}.git`;
  execSync(`git clone --depth 1 --branch ${branch} ${url} "${cloneDir}"`, { stdio: 'inherit' });

  const scanRoot = path.resolve(cloneDir, subdir);
  const skillDirs = walkForSkills(scanRoot);

  const absTarget = path.resolve(repoRoot, target);
  fs.mkdirSync(absTarget, { recursive: true });

  const written = [];
  for (const skillDir of skillDirs) {
    const name = path.basename(skillDir);
    const dest = path.join(absTarget, name);
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    copyDir(skillDir, dest);

    // Attribution breadcrumb so consumers see where this came from.
    fs.writeFileSync(
      path.join(dest, 'ATTRIBUTION.md'),
      `# Attribution\n\nSource: ${url}\nBranch: ${branch}\nAdapter: github-repo\nSource id: ${id}\n`
    );
    written.push(path.relative(repoRoot, dest));
  }

  // Preserve root LICENSE / NOTICE if present.
  for (const f of ['LICENSE', 'NOTICE', 'README.md']) {
    const src = path.join(scanRoot, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(absTarget, `UPSTREAM_${f}`));
    }
  }

  fs.rmSync(cloneDir, { recursive: true, force: true });
  return { written };
}

module.exports = { sync };
