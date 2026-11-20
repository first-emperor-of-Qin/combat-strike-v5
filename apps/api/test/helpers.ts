/**
 * Shared test helpers.
 *
 * The whole suite runs against `InMemoryDb`, so no PostgreSQL server is
 * required.
 */
import { buildApp } from '../src/app.js';
import { loadConfig, type AppConfig } from '../src/config.js';
import { InMemoryDb } from '../src/db/in-memory.js';
import type { FastifyInstance } from 'fastify';

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const base = loadConfig({ NODE_ENV: 'test' });
  return {
    ...base,
    env: 'test',
    logLevel: 'silent',
    rateLimitMax: 10_000,
    authRateLimitMax: 10_000,
    ...overrides,
  };
}

export interface TestContext {
  app: FastifyInstance;
  db: InMemoryDb;
  config: AppConfig;
}

export async function createTestApp(overrides: Partial<AppConfig> = {}): Promise<TestContext> {
  const db = new InMemoryDb();
  const config = testConfig(overrides);
  const app = await buildApp({ db, config, logger: false });
  return { app, db, config };
}

export interface RegisteredUser {
  token: string;
  id: string;
  email: string;
}

/** Registers a user and returns the token plus the public user record. */
export async function registerUser(
  app: FastifyInstance,
  email = `pilot-${Math.random().toString(36).slice(2, 10)}@combat-strike.local`,
  password = 'correct-horse-battery',
  displayName = 'Test Pilot',
): Promise<RegisteredUser> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email, password, displayName },
  });
  if (response.statusCode !== 200) {
    throw new Error(`register failed: ${response.statusCode} ${response.body}`);
  }
  const body = response.json() as { token: string; user: { id: string; email: string } };
  return { token: body.token, id: body.user.id, email: body.user.email };
}

/** The Authorization header value for a session token. */
export function bearer(token: string): string {
  return `Bearer ${token}`;
}
