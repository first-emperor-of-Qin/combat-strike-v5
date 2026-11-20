#!/usr/bin/env node
/**
 * Makes sure `@combat-strike/game-core` is built before the API is compiled
 * or tested: the API imports the profile schema and the legacy migration
 * from that package.
 *
 * The check is cheap — it only looks for the two entry files — and the build
 * is skipped entirely when the package is already built.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const distEntry = resolve(repoRoot, 'packages/game-core/dist/index.js');
const distTypes = resolve(repoRoot, 'packages/game-core/dist/index.d.ts');

if (existsSync(distEntry) && existsSync(distTypes)) {
  process.exit(0);
}

console.log('@combat-strike/game-core is not built — building it now…');
const result = spawnSync('npm', ['run', 'build', '-w', '@combat-strike/game-core'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if (result.status !== 0) {
  console.error(
    'Failed to build @combat-strike/game-core. ' +
      'Run `npm run build -w @combat-strike/game-core` manually.',
  );
  process.exit(result.status ?? 1);
}
