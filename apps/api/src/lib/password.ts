/**
 * Password hashing with Node's built-in scrypt.
 *
 * scrypt is memory-hard, ships with Node (no native addon to compile) and is
 * perfectly adequate for a game account backend. The stored format is:
 *
 *   scrypt$<N>$<r>$<p>$<base64 salt>$<base64 derived key>
 *
 * Every user gets a fresh random salt, and verification is timing-safe.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import type { ScryptConfig } from '../config.js';

const SCRYPT_PREFIX = 'scrypt';

export interface ScryptOptions {
  N: number;
  r: number;
  p: number;
  maxmem: number;
}

function derive(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

/** scrypt needs `128 * N * r` bytes; give it generous head room. */
function maxmemFor(config: ScryptConfig): number {
  return Math.max(32 * 1024 * 1024, 256 * config.N * config.r);
}

/** Hashes a password with a fresh random salt. */
export async function hashPassword(password: string, config: ScryptConfig): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, config.keylen, {
    N: config.N,
    r: config.r,
    p: config.p,
    maxmem: maxmemFor(config),
  });
  return [SCRYPT_PREFIX, config.N, config.r, config.p, salt.toString('base64'), key.toString('base64')].join('$');
}

/** Parses a stored hash. Returns `null` when the format is not understood. */
export function parsePasswordHash(stored: string): {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
} | null {
  const parts = stored.split('$');
  if (parts.length !== 6) return null;
  const [prefix, rawN, rawR, rawP, rawSalt, rawKey] = parts;
  if (prefix !== SCRYPT_PREFIX) return null;
  if (rawN === undefined || rawR === undefined || rawP === undefined || rawSalt === undefined || rawKey === undefined) {
    return null;
  }
  const N = Number.parseInt(rawN, 10);
  const r = Number.parseInt(rawR, 10);
  const p = Number.parseInt(rawP, 10);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return null;
  const salt = Buffer.from(rawSalt, 'base64');
  const key = Buffer.from(rawKey, 'base64');
  if (salt.length === 0 || key.length === 0) return null;
  return { N, r, p, salt, key };
}

/**
 * Verifies a password against a stored hash in constant time.
 * Returns `false` for malformed hashes instead of throwing.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parsePasswordHash(stored);
  if (!parsed) return false;
  const derived = await derive(password, parsed.salt, parsed.key.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
    maxmem: maxmemFor({ N: parsed.N, r: parsed.r, p: parsed.p, keylen: parsed.key.length }),
  });
  if (derived.length !== parsed.key.length) return false;
  return timingSafeEqual(derived, parsed.key);
}
