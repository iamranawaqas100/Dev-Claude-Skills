const chalk = require('chalk');
const registry = require('../lib/registry');

module.exports = function list(opts) {
  const all = registry.allSkills();
  const filtered = opts.stack ? all.filter((s) => s.stack === opts.stack) : all;

  if (opts.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }

  const groups = new Map();
  for (const s of filtered) {
    if (!groups.has(s.stack)) groups.set(s.stack, []);
    groups.get(s.stack).push(s);
  }

  for (const [stack, skills] of groups.entries()) {
    console.log(chalk.bold(`\n${stack}  (${skills.length})`));
    for (const s of skills) {
      console.log(`  ${chalk.cyan(s.name.padEnd(32))} ${s.description}`);
    }
  }
  console.log(`\n${filtered.length} skill(s) total.`);
};
