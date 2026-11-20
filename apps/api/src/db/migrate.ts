/**
 * Migration runner.
 *
 * The `migrations/*.sql` files are applied in file-name order and recorded in
 * the `schema_migrations` table, so running the script twice is a no-op. A
 * PostgreSQL advisory lock serialises concurrent instances: the second one
 * waits until the first has finished and then finds everything applied.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import { loadConfig } from '../config.js';
import { createPool } from './pool.js';

const here = dirname(fileURLToPath(import.meta.url));

/** Directory holding the numbered `*.sql` files. */
export const MIGRATIONS_DIR = resolve(here, '../../migrations');

/** Advisory-lock key; any string works, it just has to be stable. */
const ADVISORY_LOCK_KEY = 'combat-strike.api.migrations';

export interface MigrationOutcome {
  /** Files applied by this run. */
  applied: string[];
  /** Files that were already applied. */
  skipped: string[];
}

export interface MigrationOptions {
  /** Overrides the migrations directory (used by the tests). */
  dir?: string;
  /** Progress logger. */
  log?: (message: string) => void;
}

/** Applies every pending migration. Safe to run concurrently and repeatedly. */
export async function runMigrations(
  pool: Pool,
  options: MigrationOptions = {},
): Promise<MigrationOutcome> {
  const dir = options.dir ?? MIGRATIONS_DIR;
  const log = options.log ?? (() => {});
  const applied: string[] = [];
  const skipped: string[] = [];

  const client = await pool.connect();
  try {
    // Session-scoped advisory lock: other instances block here until we are done.
    await client.query('SELECT pg_advisory_lock(hashtext($1))', [ADVISORY_LOCK_KEY]);

    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

    const existing = await client.query<{ filename: string; checksum: string }>(
      'SELECT filename, checksum FROM schema_migrations',
    );
    const known = new Map(existing.rows.map((row) => [row.filename, row.checksum]));

    const files = (await readdir(dir)).filter((file) => file.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = await readFile(join(dir, file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const previous = known.get(file);
      if (previous !== undefined) {
        if (previous !== checksum) {
          log(`! ${file} differs from the applied version (checksum mismatch) — skipped`);
        } else {
          log(`= ${file} already applied`);
        }
        skipped.push(file);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)', [
          file,
          checksum,
        ]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      applied.push(file);
      log(`+ ${file} applied`);
    }

    return { applied, skipped };
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock(hashtext($1))', [ADVISORY_LOCK_KEY]);
    } catch {
      // The connection may already be gone; nothing to unlock.
    }
    client.release();
  }
}

/** CLI entry point. */
async function main(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config);
  try {
    const outcome = await runMigrations(pool, { log: (message) => console.log(message) });
    console.log(
      `migrations: ${outcome.applied.length} applied, ${outcome.skipped.length} already present`,
    );
  } finally {
    await pool.end();
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  main().catch((error: unknown) => {
    console.error('migration failed:', error);
    process.exit(1);
  });
}
