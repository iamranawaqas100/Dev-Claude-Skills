/**
 * Copy a skill directory into the user's Claude skills folder.
 */
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const chalk = require('chalk');
const registry = require('./registry');

function resolveTarget({ project, target }) {
  if (target) return path.resolve(target);
  if (project) return path.resolve(process.cwd(), '.claude', 'skills');
  return path.join(os.homedir(), '.claude', 'skills');
}

async function installSkill(skill, targetRoot, { overwrite = false } = {}) {
  const src = registry.skillAbsPath(skill);
  const dest = path.join(targetRoot, skill.name);

  if (await fs.pathExists(dest)) {
    if (!overwrite) {
      console.log(chalk.yellow(`  ~ ${skill.name} already exists at ${dest} — skipping`));
      return { installed: false, reason: 'exists' };
    }
    await fs.remove(dest);
  }

  await fs.copy(src, dest, {
    filter: (p) => !p.endsWith('ATTRIBUTION.md') === false ? true : true, // keep everything
  });
  console.log(chalk.green(`  + ${skill.name}`) + chalk.gray(`  → ${dest}`));
  return { installed: true, dest };
}

module.exports = { resolveTarget, installSkill };
