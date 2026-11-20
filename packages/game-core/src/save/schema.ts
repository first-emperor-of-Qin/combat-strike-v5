/**
 * Player profile schema — the single save format for the rewrite.
 *
 * The legacy build stored five unrelated localStorage blobs with no version
 * field and no transaction, so a partial write could leave the gold balance
 * and the hero roster out of sync. The rewrite uses one versioned document
 * with an explicit schema version and a monotonic revision for conflict
 * detection.
 *
 * Legacy migration reads the six legacy keys and produces a Profile; see
 * `migrateLegacySave` in `legacy-migration.ts`.
 */
import { z } from 'zod';

/** Current schema version. Bump when the shape changes incompatibly. */
export const PROFILE_SCHEMA_VERSION = 5;

export const WEAPON_SLOTS = ['primary', 'secondary', 'melee', 'grenade', 'tactical'] as const;
export type ProfileWeaponSlot = (typeof WEAPON_SLOTS)[number];

export const keymapSchema = z.object({
  moveForward: z.string(),
  moveBackward: z.string(),
  moveLeft: z.string(),
  moveRight: z.string(),
  jump: z.string(),
  reload: z.string(),
  weaponSkill: z.string(),
  weaponSpecial: z.string(),
  pause: z.string(),
  panel: z.string(),
  skipBoss: z.string(),
  holdFire: z.string(),
});

export const settingsSchema = z.object({
  masterVolume: z.number().min(0).max(1),
  musicVolume: z.number().min(0).max(1),
  sfxMuted: z.boolean(),
  musicMuted: z.boolean(),
  /** Graphics tier 0..3 (低 / 中 / 高 / 极致). */
  qualityLevel: z.number().int().min(0).max(3),
  /** Auto-adjust the graphics tier from the measured frame rate. */
  adaptiveQuality: z.boolean(),
  /** Mouse look sensitivity, in radians per pixel. */
  mouseSensitivity: z.number().min(0.0005).max(0.02),
  /** Vertical field of view in degrees. */
  fov: z.number().min(60).max(110),
  /** Screen shake multiplier, 0 disables shake entirely. */
  shakeIntensity: z.number().min(0).max(2),
  /** Reduces full-screen flashes and screen shake for sensitive players. */
  reduceFlashing: z.boolean(),
  /** Show the frame-rate counter. */
  showFps: z.boolean(),
  keymap: keymapSchema,
});

export const loadoutSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  melee: z.string(),
  grenade: z.string(),
  tactical: z.string(),
});

export const progressionSchema = z.object({
  gold: z.number().int().nonnegative(),
  ownedWeapons: z.record(z.boolean()),
  ownedDragoons: z.record(z.boolean()),
  equippedDragoon: z.string(),
  ownedCharacters: z.record(z.boolean()),
  fragments: z.number().int().nonnegative(),
  selectedCharacter: z.string(),
  equippedCompanion: z.string(),
  /** Weapon level per weapon id, 1..10. */
  weaponLevels: z.record(z.number().int().min(1).max(10)),
  /** Weapon XP per weapon id. */
  weaponXp: z.record(z.number().int().nonnegative()),
  /** Highest unlocked difficulty tier per level, 1..10. */
  unlockedDifficulties: z.record(z.number().int().min(1).max(10)),
  /** Highest level cleared, 0 when nothing has been cleared yet. */
  highestClearedLevel: z.number().int().min(0).max(50),
  /** Difficulty skip cards. */
  difficultySkipCards: z.number().int().nonnegative(),
});

/**
 * Provenance of the profile.
 *
 *  - `local`   : created on this device, never pushed to the server.
 *  - `imported`: came from a legacy save or a manual import; the server has
 *                NOT confirmed it yet.
 *  - `synced`  : the server holds this exact revision.
 */
export const syncStateSchema = z.enum(['local', 'imported', 'synced']);

export const profileSchema = z.object({
  schemaVersion: z.number().int(),
  /** Provenance of the save; see `syncStateSchema`. */
  syncState: syncStateSchema,
  /** Monotonic revision, used for optimistic concurrency on the server. */
  revision: z.number().int().nonnegative(),
  /** Epoch milliseconds of the last local write. */
  updatedAt: z.number().int().nonnegative(),
  progression: progressionSchema,
  loadout: loadoutSchema,
  settings: settingsSchema,
  /** Free-form counters kept for future meta systems. */
  stats: z.record(z.number()),
});

export type PlayerProfile = z.infer<typeof profileSchema>;
export type ProfileSettings = z.infer<typeof settingsSchema>;
export type ProfileProgression = z.infer<typeof progressionSchema>;
export type ProfileLoadout = z.infer<typeof loadoutSchema>;

/**
 * Default key map. Matches the legacy DEFAULT_KEYMAP (baseline
 * index.html:17589-17595) apart from the legacy `weaponSkill: KeyE` binding,
 * which the legacy loader already migrated to the middle mouse button.
 */
export const DEFAULT_KEYMAP: Record<keyof z.infer<typeof keymapSchema>, string> = {
  moveForward: 'KeyW',
  moveBackward: 'KeyS',
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  jump: 'Space',
  reload: 'KeyR',
  weaponSkill: 'Mouse2',
  weaponSpecial: 'KeyX',
  pause: 'Escape',
  panel: 'KeyQ',
  skipBoss: 'KeyM',
  holdFire: 'KeyK',
};

export const DEFAULT_SETTINGS: ProfileSettings = {
  masterVolume: 1,
  musicVolume: 0.5,
  sfxMuted: false,
  musicMuted: false,
  qualityLevel: 2,
  adaptiveQuality: true,
  mouseSensitivity: 0.002,
  fov: 75,
  shakeIntensity: 1,
  reduceFlashing: false,
  showFps: false,
  keymap: DEFAULT_KEYMAP,
};

export const DEFAULT_LOADOUT: ProfileLoadout = {
  primary: 'thunder',
  secondary: 'shadow',
  melee: 'thunderblade',
  grenade: 'normalgrenade',
  tactical: 'none',
};

/** A brand new profile: starter weapons only, tier-1 difficulty everywhere. */
export function createDefaultProfile(now = Date.now()): PlayerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    syncState: 'local',
    revision: 0,
    updatedAt: now,
    progression: {
      gold: 0,
      ownedWeapons: { thunder: true, shadow: true, thunderblade: true, normalgrenade: true },
      ownedDragoons: { icesparrow: true },
      equippedDragoon: 'none',
      ownedCharacters: { initiate: true },
      fragments: 0,
      selectedCharacter: 'initiate',
      equippedCompanion: '',
      weaponLevels: {},
      weaponXp: {},
      unlockedDifficulties: {},
      highestClearedLevel: 0,
      difficultySkipCards: 0,
    },
    loadout: { ...DEFAULT_LOADOUT },
    settings: { ...DEFAULT_SETTINGS, keymap: { ...DEFAULT_KEYMAP } },
    stats: {},
  };
}

/**
 * Normalises an arbitrary object into a valid profile, filling gaps with
 * defaults. Used both for local loads and for server-side validation, so a
 * corrupt or partial document never crashes the game.
 */
export function normaliseProfile(input: unknown, now = Date.now()): PlayerProfile {
  const base = createDefaultProfile(now);
  if (!input || typeof input !== 'object') return base;
  const raw = input as Record<string, any>;

  const merged: PlayerProfile = {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    syncState: raw.syncState === 'imported' || raw.syncState === 'synced' ? raw.syncState : 'local',
    revision: typeof raw.revision === 'number' && Number.isFinite(raw.revision) ? Math.max(0, Math.floor(raw.revision)) : 0,
    updatedAt: typeof raw.updatedAt === 'number' && Number.isFinite(raw.updatedAt) ? raw.updatedAt : now,
    progression: { ...base.progression, ...(raw.progression ?? {}) },
    loadout: { ...base.loadout, ...(raw.loadout ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    stats: { ...(raw.stats ?? {}) },
  };

  // Nested objects need per-key merging so a partial document keeps defaults.
  merged.progression.ownedWeapons = { ...base.progression.ownedWeapons, ...(raw.progression?.ownedWeapons ?? {}) };
  merged.progression.ownedDragoons = { ...base.progression.ownedDragoons, ...(raw.progression?.ownedDragoons ?? {}) };
  merged.progression.ownedCharacters = { ...base.progression.ownedCharacters, ...(raw.progression?.ownedCharacters ?? {}) };
  merged.progression.weaponLevels = { ...(raw.progression?.weaponLevels ?? {}) };
  merged.progression.weaponXp = { ...(raw.progression?.weaponXp ?? {}) };
  merged.progression.unlockedDifficulties = { ...(raw.progression?.unlockedDifficulties ?? {}) };
  merged.settings.keymap = { ...DEFAULT_KEYMAP, ...(raw.settings?.keymap ?? {}) };

  const parsed = profileSchema.safeParse(merged);
  if (parsed.success) return parsed.data;
  // Fall back to defaults when the document cannot be repaired field by field.
  return base;
}
