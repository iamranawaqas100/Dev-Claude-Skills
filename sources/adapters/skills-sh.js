/**
 * skills-sh adapter (stub)
 *
 * When enabled, will call skills.sh's public listing to pick top-N skills,
 * then delegate to github-repo cloning for each referenced repo.
 *
 * Disabled by default — flip `enabled: true` in sources.json and implement
 * the fetch once the exact skills.sh API shape is confirmed.
 */
const githubRepo = require('./github-repo');

async function sync(config, ctx) {
  const { filter = {}, target } = config;
  console.warn(
    `[skills-sh] adapter is a stub — filter=${JSON.stringify(filter)}, target=${target}. ` +
      `Enable and implement in sources/adapters/skills-sh.js when ready.`
  );
  return { written: [] };
}

module.exports = { sync, _delegate: githubRepo };
