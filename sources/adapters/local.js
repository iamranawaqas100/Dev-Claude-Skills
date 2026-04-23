/**
 * local adapter
 *
 * No-op: in-repo skills live at the `target` path and are authored directly.
 * This adapter exists so sources.json has a single consistent shape.
 */
async function sync(config) {
  return { written: [], note: `local source — nothing to sync for ${config.id}` };
}

module.exports = { sync };
