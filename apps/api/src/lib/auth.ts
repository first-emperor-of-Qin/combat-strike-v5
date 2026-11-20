/**
 * Session handling: signed session tokens plus the Fastify authentication
 * hook.
 *
 * A session token is a compact JWT (HS256) signed with the server secret. It
 * carries the user id (`sub`) and the session id (`sid`). The session row in
 * the database stores only the SHA-256 hash of the token, so a database leak
 * does not hand out usable sessions.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { preHandlerHookHandler } from 'fastify';
import type { AppConfig } from '../config.js';
import type { AuthUser, Db } from '../db/types.js';
import { ApiError } from './errors.js';

export interface SessionToken {
  userId: string;
  sessionId: string;
}

/** SHA-256 of the token, hex encoded. Only the hash is stored. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/** Constant-time comparison of two hex digests. */
export function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function secretKey(config: AppConfig): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

/** Signs a session token for the given user and session. */
export async function issueSessionToken(
  config: AppConfig,
  claims: SessionToken,
  now: number = Date.now(),
): Promise<string> {
  return new SignJWT({ sid: claims.sessionId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.userId)
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor(now / 1000) + config.sessionTtlSeconds)
    .sign(secretKey(config));
}

/**
 * Verifies the signature and expiry of a session token.
 * Returns `null` for anything that is not a valid, unexpired token.
 */
export async function verifySessionToken(
  config: AppConfig,
  token: string,
  now: number = Date.now(),
): Promise<SessionToken | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(config), {
      algorithms: ['HS256'],
      currentDate: new Date(now),
    });
    const userId = payload.sub;
    const sessionId = typeof payload['sid'] === 'string' ? payload['sid'] : undefined;
    if (!userId || !sessionId) return null;
    return { userId, sessionId };
  } catch {
    return null;
  }
}

/** Extracts the bearer token from an Authorization header. */
export function bearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^bearer\s+(.+)$/i.exec(header.trim());
  if (!match || !match[1]) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

/**
 * Builds the `preHandler` that populates `request.user`.
 * Every protected route uses it; it never throws a raw error, always an
 * `ApiError` with the standard envelope.
 */
export function createAuthenticateHook(deps: { db: Db; config: AppConfig }): preHandlerHookHandler {
  return async (request) => {
    const token = bearerToken(request.headers.authorization);
    if (!token) throw ApiError.unauthorized('Missing bearer token');

    const verified = await verifySessionToken(deps.config, token);
    if (!verified) throw ApiError.unauthorized('Invalid or expired session');

    const session = await deps.db.findSessionById(verified.sessionId);
    if (!session) throw ApiError.unauthorized('Invalid or expired session');
    if (session.expiresAt.getTime() <= Date.now()) {
      await deps.db.deleteSessionById(session.id);
      throw ApiError.unauthorized('Session expired');
    }
    if (!timingSafeHexEqual(session.tokenHash, hashToken(token))) {
      throw ApiError.unauthorized('Invalid or expired session');
    }

    const user = await deps.db.findUserById(verified.userId);
    if (!user) throw ApiError.unauthorized('Invalid or expired session');

    request.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  };
}

/** The public representation of a user. */
export function publicUser(user: AuthUser): {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
} {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}
