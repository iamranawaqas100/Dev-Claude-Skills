const chalk = require('chalk');
const Fuse = require('fuse.js');
const registry = require('../lib/registry');

module.exports = function search(query) {
  const all = registry.allSkills();
  const fuse = new Fuse(all, {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  });
  const results = fuse.search(query).slice(0, 20);
  if (!results.length) {
    console.log(`No matches for "${query}".`);
    return;
  }
  console.log(chalk.bold(`\n${results.length} match(es) for "${query}":\n`));
  for (const { item } of results) {
    console.log(`  ${chalk.cyan(item.name.padEnd(32))} ${chalk.gray(`[${item.stack}]`)}  ${item.description}`);
  }
};
