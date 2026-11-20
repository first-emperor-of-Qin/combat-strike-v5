/**
 * Profile routes.
 *
 * A profile row belongs to exactly one user: every statement below is scoped
 * by the authenticated user's id, so one account can never read or overwrite
 * another account's profile.
 *
 * Conflict semantics (optimistic concurrency):
 *  - the client sends `baseRevision`, the revision it last saw;
 *  - if the stored revision differs, the request is rejected with 409 and the
 *    current profile is returned so the client can prompt the player;
 *  - if the payload is unchanged, the revision is *not* bumped, which makes a
 *    retried request a no-op.
 */
import type { FastifyPluginAsync } from 'fastify';
import { LEGACY_KEYS, migrateLegacySave, type LegacySnapshot } from '@combat-strike/game-core';
import { ApiError } from '../lib/errors.js';
import {
  defaultProfile,
  importProfileBodySchema,
  profilesEqual,
  putProfileBodySchema,
  toStoredProfile,
} from '../lib/profile.js';

export const profileRoutes: FastifyPluginAsync = async (app) => {
  const db = app.db;

  /** Reads the caller's profile, or the default profile when none exists. */
  app.get('/api/profile', { preHandler: app.authenticate }, async (request) => {
    const user = request.user;
    if (!user) throw ApiError.unauthorized();

    const row = await db.getProfile(user.id);
    if (!row) {
      return { profile: defaultProfile(), revision: 0 };
    }
    return { profile: row.payload, revision: row.revision };
  });

  app.put('/api/profile', { preHandler: app.authenticate }, async (request, reply) => {
    const user = request.user;
    if (!user) throw ApiError.unauthorized();

    const parsed = putProfileBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid profile payload', {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { profile: incoming, baseRevision } = parsed.data;
    const current = await db.getProfile(user.id);
    const currentRevision = current?.revision ?? 0;
    const currentPayload = current?.payload ?? null;

    // Idempotency: an unchanged payload never bumps the revision, so a
    // retried request is a no-op.
    if (currentPayload && profilesEqual(currentPayload, incoming)) {
      return reply.status(200).send({ profile: currentPayload, revision: currentRevision });
    }

    // Conflict: the client is working from an outdated revision.
    if (baseRevision !== currentRevision) {
      throw ApiError.revisionConflict(
        'The profile was modified by another client; reload before saving again.',
        { profile: currentPayload ?? defaultProfile(), revision: currentRevision },
      );
    }

    const now = Date.now();
    const nextRevision = currentRevision + 1;
    const payload = toStoredProfile(incoming, nextRevision, now);

    const written = await db.putProfile({
      userId: user.id,
      expectedRevision: currentRevision,
      nextRevision,
      payload,
      updatedAt: new Date(now),
    });

    if (!written) {
      // Somebody else won the race between the read and the write.
      const fresh = await db.getProfile(user.id);
      throw ApiError.revisionConflict(
        'The profile was modified by another client; reload before saving again.',
        { profile: fresh?.payload ?? defaultProfile(), revision: fresh?.revision ?? 0 },
      );
    }

    return reply.status(200).send({ profile: written.payload, revision: written.revision });
  });

  app.post('/api/profile/import', { preHandler: app.authenticate }, async (request, reply) => {
    const user = request.user;
    if (!user) throw ApiError.unauthorized();

    const parsed = importProfileBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid legacy import payload', {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const knownKeys = new Set<string>(Object.values(LEGACY_KEYS));
    const snapshot: LegacySnapshot = {};
    const warnings: string[] = [];
    for (const [key, value] of Object.entries(parsed.data.legacy)) {
      if (!knownKeys.has(key)) {
        warnings.push(`未知的旧版存档键「${key}」已忽略。`);
        continue;
      }
      snapshot[key as keyof LegacySnapshot] = value ?? null;
    }

    const now = Date.now();
    const report = migrateLegacySave(snapshot, now);
    for (const warning of warnings) report.warnings.push(warning);

    const current = await db.getProfile(user.id);
    const currentRevision = current?.revision ?? 0;
    const currentPayload = current?.payload ?? null;

    if (currentPayload && profilesEqual(currentPayload, report.profile)) {
      return reply.status(200).send({
        profile: currentPayload,
        revision: currentRevision,
        report: {
          migrated: report.migrated,
          keysRead: report.keysRead,
          keysFailed: report.keysFailed,
          warnings: report.warnings,
          backup: report.backup,
        },
      });
    }

    const nextRevision = currentRevision + 1;
    const payload = toStoredProfile(report.profile, nextRevision, now);
    const written = await db.putProfile({
      userId: user.id,
      expectedRevision: currentRevision,
      nextRevision,
      payload,
      updatedAt: new Date(now),
    });

    if (!written) {
      const fresh = await db.getProfile(user.id);
      throw ApiError.revisionConflict(
        'The profile was modified by another client; reload before saving again.',
        { profile: fresh?.payload ?? defaultProfile(), revision: fresh?.revision ?? 0 },
      );
    }

    return reply.status(200).send({
      profile: written.payload,
      revision: written.revision,
      report: {
        migrated: report.migrated,
        keysRead: report.keysRead,
        keysFailed: report.keysFailed,
        warnings: report.warnings,
        backup: report.backup,
      },
    });
  });
};
