const inquirer = require('inquirer');
const registry = require('./registry');

const STACK_LABELS = {
  mern: 'MERN stack',
  next: 'Next.js',
  devtools: 'Dev Tooling (husky / lint-staged / prettier)',
  official: 'Official Anthropic Skills',
  community: 'Community Favorites',
  misc: 'Miscellaneous',
};

async function pickStack() {
  const groups = registry.skillsByStack();
  const choices = [];
  for (const [stack, skills] of groups.entries()) {
    choices.push({
      name: `${STACK_LABELS[stack] || stack} (${skills.length})`,
      value: stack,
    });
  }
  choices.push(new inquirer.Separator());
  choices.push({ name: 'Browse all', value: '__all' });

  const { stack } = await inquirer.prompt([
    { type: 'list', name: 'stack', message: 'Which stack are you working on?', choices },
  ]);
  return stack;
}

async function pickSkills(stack) {
  const pool =
    stack === '__all' ? registry.allSkills() : registry.skillsByStack().get(stack) || [];
  if (!pool.length) {
    console.log('No skills found for that stack.');
    return [];
  }
  const { picked } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'picked',
      message: 'Select skills to install (space to toggle, enter to confirm)',
      loop: false,
      pageSize: 15,
      choices: pool.map((s) => ({
        name: `${s.name.padEnd(30)}  ${s.description}`,
        value: s.name,
        short: s.name,
      })),
    },
  ]);
  return picked.map((name) => pool.find((s) => s.name === name));
}

async function pickTarget() {
  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Install target?',
      choices: [
        { name: '~/.claude/skills   (personal, all projects)', value: 'home' },
        { name: './.claude/skills   (this project only)', value: 'project' },
      ],
    },
  ]);
  return target;
}

module.exports = { pickStack, pickSkills, pickTarget };
