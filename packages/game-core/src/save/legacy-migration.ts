/**
 * Legacy save migration.
 *
 * The legacy build kept five independent localStorage blobs with no version
 * field. This module reads all of them, repairs what it can, and produces a
 * single versioned profile. It is deliberately defensive: a migration must
 * never destroy a player's progress, so unreadable or partial data is
 * reported rather than thrown away silently.
 */
import {
  PROFILE_SCHEMA_VERSION,
  createDefaultProfile,
  normaliseProfile,
  DEFAULT_KEYMAP,
  type PlayerProfile,
} from './schema.js';

/** The exact localStorage keys the legacy build used. */
export const LEGACY_KEYS = {
  save: 'cs_save_v2',
  characters: 'cs_characters_v1',
  companion: 'cs_companion_v1',
  quality: 'cs_quality_pref_v1',
  arenaBest: 'cs_arena_best_v1',
  raidBest: 'cs_raid_best_v1',
} as const;

export interface LegacySnapshot {
  [LEGACY_KEYS.save]?: string | null;
  [LEGACY_KEYS.characters]?: string | null;
  [LEGACY_KEYS.companion]?: string | null;
  [LEGACY_KEYS.quality]?: string | null;
  [LEGACY_KEYS.arenaBest]?: string | null;
  [LEGACY_KEYS.raidBest]?: string | null;
}

export interface MigrationReport {
  /** True when at least one legacy blob contributed data. */
  migrated: boolean;
  /** Keys that were present and parsed. */
  keysRead: string[];
  /** Keys that were present but could not be parsed. */
  keysFailed: string[];
  /** Non-fatal notes for the player. */
  warnings: string[];
  /** A backup of the original blobs, so a migration can be undone. */
  backup: LegacySnapshot;
  profile: PlayerProfile;
}

/** Parses the legacy `cs_save_v2` blob. */
function parseLegacySave(raw: string): Record<string, any> | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    // The legacy loader only accepted a blob with gold or ownedWeapons.
    if (typeof parsed.gold !== 'number' && !(parsed.ownedWeapons && typeof parsed.ownedWeapons === 'object')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Migrates a legacy localStorage snapshot into a profile.
 *
 * Notes on fidelity:
 *  - `ts` is deliberately NOT carried over: it was the cloud conflict key of a
 *    vendor-specific backend. The rewrite uses `revision` instead.
 *  - The legacy `weaponSkill: 'KeyE'` binding is remapped to the middle mouse
 *    button, exactly as the legacy loader did (baseline index.html:17607).
 *  - `cs_characters_v1` and `cs_save_v2` share the gold economy, so they are
 *    migrated together to keep the balances in sync.
 */
export function migrateLegacySave(snapshot: LegacySnapshot, now = Date.now()): MigrationReport {
  const report: MigrationReport = {
    migrated: false,
    keysRead: [],
    keysFailed: [],
    warnings: [],
    backup: { ...snapshot },
    profile: createDefaultProfile(now),
  };

  const profile = report.profile;

  // ---- cs_save_v2 -------------------------------------------------------
  const saveRaw = snapshot[LEGACY_KEYS.save];
  let save: Record<string, any> | null = null;
  if (saveRaw) {
    save = parseLegacySave(saveRaw);
    if (save) report.keysRead.push(LEGACY_KEYS.save);
    else {
      report.keysFailed.push(LEGACY_KEYS.save);
      report.warnings.push('主存档 cs_save_v2 无法解析，已使用新档默认值。');
    }
  }

  if (save) {
    const gold = typeof save.gold === 'number' && Number.isFinite(save.gold) ? Math.max(0, Math.floor(save.gold)) : 0;
    profile.progression.gold = gold;

    if (save.ownedWeapons && typeof save.ownedWeapons === 'object') {
      for (const [id, owned] of Object.entries(save.ownedWeapons)) {
        if (owned) profile.progression.ownedWeapons[id] = true;
      }
    }

    const eq = save.equipped && typeof save.equipped === 'object' ? save.equipped : {};
    const pick = (value: unknown, fallback: string) =>
      typeof value === 'string' && value.length > 0 ? value : fallback;
    profile.loadout.primary = pick(eq.primary, profile.loadout.primary);
    profile.loadout.secondary = pick(eq.secondary, profile.loadout.secondary);
    profile.loadout.melee = pick(eq.melee, profile.loadout.melee);
    profile.loadout.grenade = pick(eq.grenadeType, profile.loadout.grenade);
    profile.loadout.tactical = pick(eq.tactical, profile.loadout.tactical);

    if (save.ownedDragoons && typeof save.ownedDragoons === 'object') {
      for (const [id, owned] of Object.entries(save.ownedDragoons)) {
        if (owned) profile.progression.ownedDragoons[id] = true;
      }
    }
    profile.progression.equippedDragoon =
      typeof save.equippedDragoon === 'string' && save.equippedDragoon !== 'none'
        ? save.equippedDragoon
        : 'none';

    if (save.weaponLevel && typeof save.weaponLevel === 'object') {
      for (const [id, lv] of Object.entries(save.weaponLevel)) {
        if (typeof lv === 'number' && Number.isFinite(lv)) {
          profile.progression.weaponLevels[id] = Math.min(10, Math.max(1, Math.floor(lv)));
        }
      }
    }
    if (save.weaponXP && typeof save.weaponXP === 'object') {
      for (const [id, xp] of Object.entries(save.weaponXP)) {
        if (typeof xp === 'number' && Number.isFinite(xp)) {
          profile.progression.weaponXp[id] = Math.max(0, Math.floor(xp));
        }
      }
    }
    if (save.unlockedDifficulties && typeof save.unlockedDifficulties === 'object') {
      for (const [level, tier] of Object.entries(save.unlockedDifficulties)) {
        if (typeof tier === 'number' && Number.isFinite(tier)) {
          profile.progression.unlockedDifficulties[level] = Math.min(10, Math.max(1, Math.floor(tier)));
        }
      }
    }
    if (typeof save.difficultySkipCards === 'number' && Number.isFinite(save.difficultySkipCards)) {
      profile.progression.difficultySkipCards = Math.max(0, Math.floor(save.difficultySkipCards));
    }

    // Settings that lived inside the main save.
    if (typeof save.masterVolume === 'number') profile.settings.masterVolume = clamp01(save.masterVolume);
    if (typeof save.musicVolume === 'number') profile.settings.musicVolume = clamp01(save.musicVolume);
    if (typeof save.sfxMuted === 'boolean') profile.settings.sfxMuted = save.sfxMuted;
    if (typeof save.musicMuted === 'boolean') profile.settings.musicMuted = save.musicMuted;

    if (save.keymap && typeof save.keymap === 'object') {
      for (const action of Object.keys(DEFAULT_KEYMAP) as (keyof typeof DEFAULT_KEYMAP)[]) {
        const code = save.keymap[action];
        if (typeof code !== 'string' || !code) continue;
        // The only migration the legacy build itself performed.
        profile.settings.keymap[action] =
          action === 'weaponSkill' && code === 'KeyE' ? 'Mouse2' : code;
      }
    }

    report.migrated = true;
  }

  // ---- cs_characters_v1 -------------------------------------------------
  const charRaw = snapshot[LEGACY_KEYS.characters];
  if (charRaw) {
    try {
      const chars = JSON.parse(charRaw);
      if (chars && typeof chars === 'object') {
        if (chars.owned && typeof chars.owned === 'object') {
          for (const [id, owned] of Object.entries(chars.owned)) {
            if (owned) profile.progression.ownedCharacters[id] = true;
          }
        }
        if (typeof chars.frags === 'number' && Number.isFinite(chars.frags)) {
          profile.progression.fragments = Math.max(0, Math.floor(chars.frags));
        }
        if (typeof chars.selected === 'string' && chars.selected) {
          // Legacy invariant: the selected hero must be owned.
          if (profile.progression.ownedCharacters[chars.selected]) {
            profile.progression.selectedCharacter = chars.selected;
          } else {
            report.warnings.push(`已选角色「${chars.selected}」未拥有，已回退为「初心者」。`);
          }
        }
        report.keysRead.push(LEGACY_KEYS.characters);
        report.migrated = true;
      } else {
        report.keysFailed.push(LEGACY_KEYS.characters);
        report.warnings.push('角色存档 cs_characters_v1 格式异常，已跳过。');
      }
    } catch {
      report.keysFailed.push(LEGACY_KEYS.characters);
      report.warnings.push('角色存档 cs_characters_v1 无法解析，已跳过。');
    }
  }

  // ---- cs_companion_v1 (a bare string, not JSON) -----------------------
  const companionRaw = snapshot[LEGACY_KEYS.companion];
  if (companionRaw !== undefined && companionRaw !== null) {
    const value = companionRaw.trim();
    // Unknown ids are ignored by the legacy reader; keep the same behaviour.
    if (value) profile.progression.equippedCompanion = value;
    report.keysRead.push(LEGACY_KEYS.companion);
    report.migrated = true;
  }

  // ---- cs_quality_pref_v1 ----------------------------------------------
  const qualityRaw = snapshot[LEGACY_KEYS.quality];
  if (qualityRaw) {
    try {
      const q = JSON.parse(qualityRaw);
      if (q && typeof q === 'object') {
        if (typeof q.level === 'number') {
          profile.settings.qualityLevel = Math.min(3, Math.max(0, Math.floor(q.level)));
        }
        if (typeof q.adaptive === 'boolean') profile.settings.adaptiveQuality = q.adaptive;
        report.keysRead.push(LEGACY_KEYS.quality);
      } else {
        report.keysFailed.push(LEGACY_KEYS.quality);
      }
    } catch {
      report.keysFailed.push(LEGACY_KEYS.quality);
      report.warnings.push('画质偏好 cs_quality_pref_v1 无法解析，已使用默认值。');
    }
  }

  // ---- records: kept out of the profile, reported for the import log ----
  const arenaRaw = snapshot[LEGACY_KEYS.arenaBest];
  if (arenaRaw) {
    try {
      JSON.parse(arenaRaw);
      report.keysRead.push(LEGACY_KEYS.arenaBest);
    } catch {
      report.keysFailed.push(LEGACY_KEYS.arenaBest);
    }
  }
  const raidRaw = snapshot[LEGACY_KEYS.raidBest];
  if (raidRaw) {
    const parsed = Number.parseFloat(raidRaw);
    if (Number.isFinite(parsed)) report.keysRead.push(LEGACY_KEYS.raidBest);
    else report.keysFailed.push(LEGACY_KEYS.raidBest);
  }

  profile.schemaVersion = PROFILE_SCHEMA_VERSION;
  profile.updatedAt = now;
  report.profile = normaliseProfile(profile, now);
  return report;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

/**
 * Extracts a legacy snapshot from a `localStorage`-like store.
 * Kept separate so the migration can be unit tested without a browser.
 */
export function readLegacySnapshot(storage: {
  getItem(key: string): string | null;
}): LegacySnapshot {
  const snapshot: LegacySnapshot = {};
  for (const key of Object.values(LEGACY_KEYS)) {
    try {
      snapshot[key as keyof LegacySnapshot] = storage.getItem(key);
    } catch {
      snapshot[key as keyof LegacySnapshot] = null;
    }
  }
  return snapshot;
}
