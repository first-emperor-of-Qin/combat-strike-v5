/**
 * Seed script.
 *
 * Creates the demo account (and its starter profile) when it is missing.
 * Running it twice changes nothing — it is safe to call on every deploy.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultProfile } from '@combat-strike/game-core';
import { loadConfig, type AppConfig } from '../config.js';
import { hashPassword } from '../lib/password.js';
import { createPgDb, createPool } from './pool.js';
import type { Db } from './types.js';

export interface SeedResult {
  email: string;
  /** True when the account was created by this run. */
  created: boolean;
  userId: string;
  profileRevision: number;
}

/** Creates the demo user and its starter profile when they do not exist yet. */
export async function seedDatabase(db: Db, config: AppConfig): Promise<SeedResult> {
  const email = config.seedEmail.trim().toLowerCase();

  let user = await db.findUserByEmail(email);
  let created = false;
  if (!user) {
    const passwordHash = await hashPassword(config.seedPassword, config.scrypt);
    user = await db.createUser({ email, passwordHash, displayName: 'Demo Commander' });
    created = true;
  }

  let row = await db.getProfile(user.id);
  if (!row) {
    const now = Date.now();
    const payload = { ...createDefaultProfile(now), revision: 1, updatedAt: now };
    const written = await db.putProfile({
      userId: user.id,
      expectedRevision: 0,
      nextRevision: 1,
      payload,
      updatedAt: new Date(now),
    });
    row = written;
  }

  return { email, created, userId: user.id, profileRevision: row?.revision ?? 0 };
}

/** CLI entry point. */
async function main(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config);
  try {
    const result = await seedDatabase(createPgDb(pool), config);
    console.log(`seed: ${result.email} (${result.created ? 'created' : 'already present'})`);
    console.log(`seed: password is "${config.seedPassword}" — change it before going live`);
    console.log(`seed: profile revision ${result.profileRevision}`);
  } finally {
    await pool.end();
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  main().catch((error: unknown) => {
    console.error('seed failed:', error);
    process.exit(1);
  });
}
