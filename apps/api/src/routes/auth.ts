/**
 * Authentication routes: register, login, logout, current user.
 *
 * Passwords are hashed with scrypt (see `lib/password.ts`); sessions are
 * JWTs signed with HMAC (see `lib/auth.ts`).
 */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import type { AppConfig } from '../config.js';
import type { Db, UserRow } from '../db/types.js';
import { isUniqueViolation } from '../db/types.js';
import {
  bearerToken,
  hashToken,
  issueSessionToken,
  publicUser,
  verifySessionToken,
} from '../lib/auth.js';
import { ApiError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';

const registerBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(8).max(128),
    displayName: z.string().trim().min(1).max(32).optional(),
  })
  .strict();

const loginBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

/**
 * A throw-away hash used to keep the timing of "unknown email" and "wrong
 * password" comparable.
 */
let dummyHash: Promise<string> | null = null;
function timingEqualiser(config: AppConfig): Promise<string> {
  if (!dummyHash) dummyHash = hashPassword(`timing-equaliser-${config.jwtSecret.length}`, config.scrypt);
  return dummyHash;
}

interface CreatedSession {
  token: string;
  sessionId: string;
}

async function createSession(db: Db, config: AppConfig, user: UserRow): Promise<CreatedSession> {
  const sessionId = randomUUID();
  const token = await issueSessionToken(config, { userId: user.id, sessionId });
  const expiresAt = new Date(Date.now() + config.sessionTtlSeconds * 1000);
  await db.createSession({ id: sessionId, userId: user.id, tokenHash: hashToken(token), expiresAt });
  return { token, sessionId };
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  const db = app.db;
  const config = app.config;

  app.post(
    '/api/auth/register',
    {
      config: {
        rateLimit: { max: config.authRateLimitMax, timeWindow: config.rateLimitWindowMs },
      },
    },
    async (request, reply) => {
      const parsed = registerBodySchema.safeParse(request.body);
      if (!parsed.success) {
        throw ApiError.badRequest('Invalid registration payload', {
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { email, password, displayName } = parsed.data;
      const passwordHash = await hashPassword(password, config.scrypt);

      let user: UserRow;
      try {
        user = await db.createUser({ email, passwordHash, displayName: displayName ?? null });
      } catch (error) {
        if (isUniqueViolation(error)) throw ApiError.emailTaken();
        throw error;
      }

      const { token } = await createSession(db, config, user);
      return reply.status(200).send({
        token,
        user: publicUser({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        }),
      });
    },
  );

  app.post(
    '/api/auth/login',
    {
      config: {
        rateLimit: { max: config.authRateLimitMax, timeWindow: config.rateLimitWindowMs },
      },
    },
    async (request, reply) => {
      const parsed = loginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        throw ApiError.badRequest('Invalid login payload', {
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { email, password } = parsed.data;
      const user = await db.findUserByEmail(email);
      if (!user) {
        // Spend the same amount of work as a real verification.
        await verifyPassword(password, await timingEqualiser(config));
        throw ApiError.invalidCredentials();
      }
      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) throw ApiError.invalidCredentials();

      const { token } = await createSession(db, config, user);
      return reply.status(200).send({
        token,
        user: publicUser({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        }),
      });
    },
  );

  app.post('/api/auth/logout', { preHandler: app.authenticate }, async (request, reply) => {
    const token = bearerToken(request.headers.authorization);
    if (token) {
      const verified = await verifySessionToken(config, token);
      if (verified) await db.deleteSessionById(verified.sessionId);
    }
    return reply.status(204).send();
  });

  app.get('/api/me', { preHandler: app.authenticate }, async (request) => {
    const user = request.user;
    if (!user) throw ApiError.unauthorized();
    return { user: publicUser(user) };
  });
};
