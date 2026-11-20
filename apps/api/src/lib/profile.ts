/**
 * Profile validation and comparison helpers.
 *
 * The canonical shape lives in `@combat-strike/game-core` (`profileSchema`).
 * The API re-uses that schema and only makes it *stricter*: unknown keys are
 * rejected instead of silently stripped, so a client that sends a field the
 * server does not know about gets an error rather than silent data loss.
 */
import { z } from 'zod';
import {
  PROFILE_SCHEMA_VERSION,
  createDefaultProfile,
  keymapSchema,
  loadoutSchema,
  profileSchema,
  progressionSchema,
  settingsSchema,
  type PlayerProfile,
} from '@combat-strike/game-core';
import { canonicalEqual } from './json.js';

/**
 * The request-side profile schema.
 *
 * `revision` and `updatedAt` are optional in a request: they are owned by the
 * server, so a client may omit them.
 */
export const requestProfileSchema = profileSchema
  .extend({
    progression: progressionSchema.strict(),
    loadout: loadoutSchema.strict(),
    settings: settingsSchema.extend({ keymap: keymapSchema.strict() }).strict(),
    revision: z.number().int().nonnegative().optional(),
    updatedAt: z.number().int().nonnegative().optional(),
  })
  .strict();

export type RequestProfile = z.infer<typeof requestProfileSchema>;

/** The request body of `PUT /api/profile`. */
export const putProfileBodySchema = z
  .object({
    profile: requestProfileSchema,
    baseRevision: z.number().int().nonnegative(),
  })
  .strict();

/** The request body of `POST /api/profile/import`. */
export const importProfileBodySchema = z
  .object({
    legacy: z.record(z.string().nullable().optional()),
  })
  .strict();

/**
 * Removes the two server-owned fields so two profiles can be compared on
 * content only.
 */
export function profileContent(profile: PlayerProfile | RequestProfile): Record<string, unknown> {
  const { revision: _revision, updatedAt: _updatedAt, ...rest } = profile;
  return rest;
}

/**
 * True when two profiles carry the same content.
 *
 * The comparison ignores `revision` and `updatedAt` because those are owned
 * by the server — a client that re-sends the same game state must not bump
 * the revision just because its local clock moved.
 */
export function profilesEqual(a: PlayerProfile | RequestProfile, b: PlayerProfile | RequestProfile): boolean {
  return canonicalEqual(profileContent(a), profileContent(b));
}

/** A brand new profile, used when a user has never saved one. */
export function defaultProfile(now: number = Date.now()): PlayerProfile {
  return createDefaultProfile(now);
}

/** The profile as it should be stored: server-owned fields are filled in. */
export function toStoredProfile(input: RequestProfile, revision: number, now: number): PlayerProfile {
  return {
    ...input,
    schemaVersion: PROFILE_SCHEMA_VERSION,
    revision,
    updatedAt: now,
  };
}
