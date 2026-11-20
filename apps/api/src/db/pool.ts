/**
 * Connection pool factory.
 */
import { Pool } from 'pg';
import type { AppConfig } from '../config.js';
import { PgDb } from './pg.js';
import type { Db } from './types.js';

/** Creates the node-postgres pool used at runtime. */
export function createPool(config: AppConfig): Pool {
  return new Pool({
    connectionString: config.databaseUrl,
    max: config.dbPoolSize,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    application_name: 'combat-strike-api',
    ssl: config.dbSsl ? { rejectUnauthorized: false } : undefined,
  });
}

/** Creates the PostgreSQL-backed `Db`. */
export function createPgDb(pool: Pool): Db {
  return new PgDb(pool);
}

/** Creates a pool and the matching `Db` in one call. */
export function createDatabase(config: AppConfig): { pool: Pool; db: Db } {
  const pool = createPool(config);
  return { pool, db: createPgDb(pool) };
}
