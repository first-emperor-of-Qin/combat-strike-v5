#!/usr/bin/env node
/**
 * Migrates a legacy localStorage export into the new profile format.
 *
 * Usage:
 *   node tools/migrate-legacy-save.mjs <legacy-export.json> [--pretty]
 *
 * The input file is a JSON object mapping the legacy localStorage keys to
 * their raw string values, e.g.
 *
 *   {
 *     "cs_save_v2": "{\"gold\":1200,\"ownedWeapons\":{...}}",
 *     "cs_characters_v1": "{\"owned\":{...},\"frags\":3}"
 *   }
 *
 * A wrapper object (`{ "localStorage": { ... } }`) and an array of
 * `{ "key": ..., "value": ... }` entries are accepted as well.
 *
 * The migrated profile and the migration report are printed as JSON.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const distEntry = resolve(repoRoot, 'packages/game-core/dist/save/legacy-migration.js');

const BUILD_HINT =
  'The @combat-strike/game-core package is not built. ' +
  'Run `npm run build -w @combat-strike/game-core` first, then retry.';

/**
 * Loads `migrateLegacySave` from the built game-core package.
 *
 * @returns {Promise<(snapshot: object, now?: number) => object>}
 */
async function loadMigrateLegacySave() {
  // Preferred path: the compiled module inside the workspace.
  if (existsSync(distEntry)) {
    const mod = await import(pathToFileURL(distEntry).href);
    if (typeof mod.migrateLegacySave === 'function') return mod.migrateLegacySave;
  }

  // Fallback: the package export path.
  try {
    const mod = await import('@combat-strike/game-core');
    if (typeof mod.migrateLegacySave === 'function') return mod.migrateLegacySave;
  } catch {
    throw new Error(BUILD_HINT);
  }

  throw new Error(`${BUILD_HINT} (migrateLegacySave is not exported by @combat-strike/game-core)`);
}

/** Normalises the supported input shapes into a flat key -> value map. */
function readSnapshot(raw) {
  if (Array.isArray(raw)) {
    const map = {};
    for (const entry of raw) {
      if (entry && typeof entry === 'object' && typeof entry.key === 'string') {
        map[entry.key] = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value ?? null);
      }
    }
    return map;
  }
  if (raw && typeof raw === 'object' && raw.localStorage && typeof raw.localStorage === 'object') {
    return readSnapshot(raw.localStorage);
  }
  if (!raw || typeof raw !== 'object') {
    throw new Error('The legacy export must be a JSON object of localStorage entries.');
  }
  const map = {};
  for (const [key, value] of Object.entries(raw)) {
    map[key] = typeof value === 'string' ? value : JSON.stringify(value ?? null);
  }
  return map;
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith('--'));
  const pretty = args.includes('--pretty');

  if (!file) {
    console.error('Usage: node tools/migrate-legacy-save.mjs <legacy-export.json> [--pretty]');
    process.exit(2);
  }

  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) {
    console.error(`Legacy export not found: ${path}`);
    process.exit(2);
  }

  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Could not parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }

  const migrateLegacySave = await loadMigrateLegacySave();
  const snapshot = readSnapshot(raw);
  const report = migrateLegacySave(snapshot);

  const output = {
    profile: report.profile,
    report: {
      migrated: report.migrated,
      keysRead: report.keysRead,
      keysFailed: report.keysFailed,
      warnings: report.warnings,
      backup: report.backup,
    },
  };

  console.log(JSON.stringify(output, null, pretty ? 2 : 0));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
