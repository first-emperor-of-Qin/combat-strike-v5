/**
 * Configuration is read once from the environment, with sane defaults for
 * local development. In production the two secrets that must never be
 * guessed — the database URL and the session-signing key — are mandatory.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export type AppEnv = 'development' | 'test' | 'production';

export interface ScryptConfig {
  /** CPU/memory cost factor. */
  N: number;
  /** Block size. */
  r: number;
  /** Parallelisation factor. */
  p: number;
  /** Derived key length in bytes. */
  keylen: number;
}

export interface AppConfig {
  env: AppEnv;
  host: string;
  port: number;
  databaseUrl: string;
  dbPoolSize: number;
  dbSsl: boolean;
  /** HMAC key used to sign session tokens. */
  jwtSecret: string;
  /** Session lifetime in seconds. */
  sessionTtlSeconds: number;
  /** Allowed CORS origins. `['*']` allows any origin. */
  corsOrigins: string[];
  /** Global rate limit: max requests per window. */
  rateLimitMax: number;
  /** Global rate limit window in milliseconds. */
  rateLimitWindowMs: number;
  /** Rate limit applied to the auth routes (per IP). */
  authRateLimitMax: number;
  logLevel: string;
  scrypt: ScryptConfig;
  seedEmail: string;
  seedPassword: string;
  /** API version reported by /api/health. */
  version: string;
  /**
   * Directory holding the built frontend. When it exists, the API serves the
   * single-page app from the same origin, so a production deployment needs a
   * single domain and a single process.
   */
  staticDir: string | null;
}

/**
 * Resolves the directory holding the built frontend.
 * Returns null when it is not configured or does not exist, in which case the
 * API runs headless (useful for local development and for tests).
 */
function resolveStaticDir(): string | null {
  const configured = process.env.API_STATIC_DIR?.trim();
  if (!configured) return null;
  const absolute = resolve(configured);
  if (!existsSync(absolute)) return null;
  return absolute;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

const here = dirname(fileURLToPath(import.meta.url));

/** Finds the api package.json, whichever directory the code is running from. */
function readApiVersion(): string {
  let dir = here;
  for (let i = 0; i < 6; i += 1) {
    const candidate = resolve(dir, 'package.json');
    if (existsSync(candidate)) {
      try {
        const parsed = JSON.parse(readFileSync(candidate, 'utf8')) as { name?: string; version?: string };
        if (parsed.name === '@combat-strike/api' && typeof parsed.version === 'string') return parsed.version;
      } catch {
        // Keep walking up; a malformed package.json must not stop the boot.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return '0.0.0';
}

let dotenvLoaded = false;

/**
 * Loads `.env` from the current working directory and from the repository
 * root. Existing environment variables always win.
 */
export function loadDotEnv(): void {
  if (dotenvLoaded) return;
  dotenvLoaded = true;
  const repoRoot = resolve(here, '../../../..');
  for (const path of [resolve(process.cwd(), '.env'), resolve(repoRoot, '.env')]) {
    if (existsSync(path)) dotenv.config({ path });
  }
}

function readString(env: NodeJS.ProcessEnv, key: string, fallback: string): string {
  const raw = env[key];
  return raw === undefined || raw.trim() === '' ? fallback : raw.trim();
}

function readInt(env: NodeJS.ProcessEnv, key: string, fallback: number): number {
  const raw = env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBool(env: NodeJS.ProcessEnv, key: string, fallback: boolean): boolean {
  const raw = env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const normalised = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalised)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalised)) return false;
  return fallback;
}

function readEnvName(env: NodeJS.ProcessEnv): AppEnv {
  const raw = readString(env, 'NODE_ENV', 'development');
  if (raw === 'production' || raw === 'test') return raw;
  return 'development';
}

/**
 * Builds the configuration from an environment map.
 *
 * @throws ConfigError when a required secret is missing in production.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  loadDotEnv();
  const appEnv = readEnvName(env);
  const isProduction = appEnv === 'production';

  const databaseUrl = readString(
    env,
    'DATABASE_URL',
    'postgres://postgres:postgres@localhost:5432/combat_strike',
  );
  const jwtSecret = readString(env, 'JWT_SECRET', 'dev-insecure-secret-change-me-please-000000');

  if (isProduction) {
    const problems: string[] = [];
    if (!env.DATABASE_URL || env.DATABASE_URL.trim() === '') problems.push('DATABASE_URL is required');
    if (!env.JWT_SECRET || env.JWT_SECRET.trim() === '') problems.push('JWT_SECRET is required');
    if (env.JWT_SECRET !== undefined && env.JWT_SECRET.trim().length < 32) {
      problems.push('JWT_SECRET must be at least 32 characters');
    }
    if (problems.length > 0) {
      throw new ConfigError(`Invalid configuration: ${problems.join('; ')}`);
    }
  }

  const corsRaw = readString(env, 'CORS_ORIGIN', '*');
  const corsOrigins = corsRaw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return {
    env: appEnv,
    host: readString(env, 'HOST', '0.0.0.0'),
    port: readInt(env, 'PORT', 3001),
    databaseUrl,
    dbPoolSize: readInt(env, 'DB_POOL_SIZE', 10),
    dbSsl: readBool(env, 'DB_SSL', false),
    jwtSecret,
    sessionTtlSeconds: readInt(env, 'SESSION_TTL_SECONDS', 60 * 60 * 24 * 7),
    corsOrigins: corsOrigins.length > 0 ? corsOrigins : ['*'],
    rateLimitMax: readInt(env, 'RATE_LIMIT_MAX', 300),
    rateLimitWindowMs: readInt(env, 'RATE_LIMIT_WINDOW_MS', 60_000),
    authRateLimitMax: readInt(env, 'AUTH_RATE_LIMIT_MAX', 20),
    logLevel: readString(env, 'LOG_LEVEL', appEnv === 'test' ? 'silent' : 'info'),
    scrypt: {
      N: readInt(env, 'SCRYPT_N', 16_384),
      r: readInt(env, 'SCRYPT_R', 8),
      p: readInt(env, 'SCRYPT_P', 1),
      keylen: readInt(env, 'SCRYPT_KEYLEN', 64),
    },
    seedEmail: readString(env, 'SEED_EMAIL', 'demo@combat-strike.local'),
    seedPassword: readString(env, 'SEED_PASSWORD', 'demo-password-1234'),
    version: readApiVersion(),
    staticDir: resolveStaticDir(),
  };
}
