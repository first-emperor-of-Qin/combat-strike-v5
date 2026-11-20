/**
 * Builds the workspace dependencies this package type-checks against.
 *
 * The workspace packages expose their types through `dist/`, so a clean
 * checkout has nothing to resolve until they are built. This runs the build
 * only when the output is missing, so a warm tree stays fast.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

/** Each dependency and the file that proves it has been built. */
const DEPENDENCIES = [
  { workspace: '@combat-strike/content', marker: 'packages/content/dist/index.d.ts' },
  { workspace: '@combat-strike/game-core', marker: 'packages/game-core/dist/index.d.ts' },
];

const missing = DEPENDENCIES.filter((dep) => !existsSync(resolve(repoRoot, dep.marker)));

if (missing.length > 0) {
  console.log(`[ensure-deps] building ${missing.map((d) => d.workspace).join(', ')}`);
  for (const dep of missing) {
    const result = spawnSync('npm', ['run', 'build', '-w', dep.workspace], {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (result.status !== 0) {
      console.error(`[ensure-deps] failed to build ${dep.workspace}`);
      process.exit(result.status ?? 1);
    }
  }
} else {
  console.log('[ensure-deps] workspace dependencies are already built');
}
