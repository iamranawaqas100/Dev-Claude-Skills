const { Command } = require('commander');
const pkg = require('../../package.json');
const install = require('./commands/install');
const list = require('./commands/list');
const search = require('./commands/search');

const program = new Command();

program
  .name('ninja-skills')
  .description('Install curated Claude Code skills from the CodeNinja catalog.')
  .version(pkg.version);

program
  .command('install', { isDefault: true })
  .description('Interactive picker: choose a stack and install skills.')
  .option('-p, --project', 'install into ./.claude/skills instead of ~/.claude/skills')
  .option('-t, --target <dir>', 'install into an explicit directory (overrides other flags)')
  .action(install.interactive);

program
  .command('add <name...>')
  .description('Install one or more skills by name, no prompts.')
  .option('-p, --project', 'install into ./.claude/skills')
  .option('-t, --target <dir>', 'explicit target directory')
  .action(install.direct);

program
  .command('list')
  .description('Print the full skill catalog.')
  .option('-s, --stack <stack>', 'filter by stack (mern, next, official, community, devtools, ...)')
  .option('--json', 'emit machine-readable JSON')
  .action(list);

program
  .command('search <query>')
  .description('Fuzzy-search skills by name, description, or tag.')
  .action(search);

program.parseAsync(process.argv).catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
