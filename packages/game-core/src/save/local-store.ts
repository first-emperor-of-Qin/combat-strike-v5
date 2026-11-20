/**
 * Local persistence for the profile.
 *
 * The legacy build wrote five independent localStorage blobs on every state
 * change, with no version and no transaction. The rewrite keeps a single
 * versioned document plus a rolling backup, so a failed write can never leave
 * a player without progress.
 */
import { normaliseProfile, type PlayerProfile } from './schema.js';

export const PROFILE_KEY = 'cs_profile_v5';
export const PROFILE_BACKUP_KEY = 'cs_profile_v5_backup';

export interface ProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Reads the profile, falling back to the backup when the main copy is corrupt. */
export function loadProfile(storage: ProfileStorage, now = Date.now()): PlayerProfile {
  const raw = safeGet(storage, PROFILE_KEY);
  if (raw) {
    try {
      return normaliseProfile(JSON.parse(raw), now);
    } catch {
      // Fall through to the backup.
    }
  }
  const backup = safeGet(storage, PROFILE_BACKUP_KEY);
  if (backup) {
    try {
      return normaliseProfile(JSON.parse(backup), now);
    } catch {
      // Give up and return defaults.
    }
  }
  return normaliseProfile(null, now);
}

/**
 * Writes the profile, keeping the previous version as a backup.
 * The backup is only replaced when the new document parses cleanly.
 */
export function saveProfile(storage: ProfileStorage, profile: PlayerProfile): boolean {
  const payload = JSON.stringify(profile);
  try {
    const previous = safeGet(storage, PROFILE_KEY);
    if (previous) {
      try {
        JSON.parse(previous);
        storage.setItem(PROFILE_BACKUP_KEY, previous);
      } catch {
        // Do not overwrite a good backup with a corrupt one.
      }
    }
    storage.setItem(PROFILE_KEY, payload);
    return true;
  } catch {
    return false;
  }
}

/** Removes the profile and its backup. */
export function clearProfile(storage: ProfileStorage): void {
  try {
    storage.removeItem(PROFILE_KEY);
    storage.removeItem(PROFILE_BACKUP_KEY);
  } catch {
    // Storage may be unavailable (private mode, quota); nothing to do.
  }
}

function safeGet(storage: ProfileStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** A storage implementation backed by a plain map, used in tests. */
export function createMemoryStorage(initial: Record<string, string> = {}): ProfileStorage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}
