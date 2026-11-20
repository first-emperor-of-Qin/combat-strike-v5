/**
 * Profile store.
 *
 * Owns the single source of truth for player progress. Writes are debounced
 * to local storage and pushed to the cloud when a session is available; the
 * game never blocks on the network.
 */
import {
  createDefaultProfile,
  loadProfile,
  saveProfile,
  normaliseProfile,
  type PlayerProfile,
} from '@combat-strike/game-core';

export type ProfileListener = (profile: PlayerProfile) => void;

export class ProfileStore {
  private profile: PlayerProfile;
  private listeners = new Set<ProfileListener>();
  private saveTimer: number | null = null;
  private dirty = false;

  constructor(storage: Storage = window.localStorage) {
    this.profile = loadProfile(storage);
  }

  get current(): PlayerProfile {
    return this.profile;
  }

  subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    listener(this.profile);
    return () => this.listeners.delete(listener);
  }

  /** Applies a partial update and schedules a save. */
  update(mutator: (draft: PlayerProfile) => void, immediate = false): void {
    const draft = structuredClone(this.profile);
    mutator(draft);
    this.profile = normaliseProfile(draft, Date.now());
    this.dirty = true;
    this.emit();
    this.scheduleSave(immediate);
  }

  /** Replaces the profile wholesale, e.g. after a cloud pull or an import. */
  replace(profile: PlayerProfile, immediate = true): void {
    this.profile = normaliseProfile(profile, Date.now());
    this.dirty = true;
    this.emit();
    this.scheduleSave(immediate);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.profile);
  }

  private scheduleSave(immediate: boolean): void {
    if (immediate) {
      this.flush();
      return;
    }
    if (this.saveTimer !== null) return;
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      this.flush();
    }, 400);
  }

  /** Writes to local storage right now. */
  flush(): void {
    if (!this.dirty) return;
    saveProfile(window.localStorage, this.profile);
    this.dirty = false;
  }

  /** Called when the page goes away, so nothing is lost. */
  dispose(): void {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.flush();
  }

  reset(): void {
    this.profile = createDefaultProfile(Date.now());
    this.dirty = true;
    this.emit();
    this.flush();
  }
}
