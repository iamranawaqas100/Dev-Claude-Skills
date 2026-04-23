const chalk = require('chalk');
const registry = require('../lib/registry');
const installer = require('../lib/installer');
const prompt = require('../lib/prompt');

async function interactive(opts) {
  const stack = await prompt.pickStack();
  const skills = await prompt.pickSkills(stack);
  if (!skills.length) {
    console.log('Nothing selected. Exiting.');
    return;
  }

  let targetRoot;
  if (opts.target) {
    targetRoot = installer.resolveTarget({ target: opts.target });
  } else {
    const choice = await prompt.pickTarget();
    targetRoot = installer.resolveTarget({ project: choice === 'project' });
  }

  console.log(chalk.bold(`\nInstalling ${skills.length} skill(s) to ${targetRoot}\n`));
  for (const s of skills) await installer.installSkill(s, targetRoot);
  console.log(chalk.bold('\nDone.'));
}

async function direct(names, opts) {
  const targetRoot = installer.resolveTarget(opts);
  console.log(chalk.bold(`Installing to ${targetRoot}\n`));
  for (const name of names) {
    const skill = registry.findByName(name);
    if (!skill) {
      console.log(chalk.red(`  ✗ unknown skill: ${name}`));
      continue;
    }
    await installer.installSkill(skill, targetRoot);
  }
}

module.exports = { interactive, direct };
