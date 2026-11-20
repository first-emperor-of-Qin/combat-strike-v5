import { describe, expect, it } from 'vitest';
import {
  LEGACY_KEYS,
  migrateLegacySave,
  readLegacySnapshot,
  createMemoryStorage,
  loadProfile,
  saveProfile,
  PROFILE_KEY,
  PROFILE_BACKUP_KEY,
  createDefaultProfile,
} from '../src/index.js';

describe('legacy save migration', () => {
  const validSave = JSON.stringify({
    gold: 123456,
    ownedWeapons: { thunder: true, tumo: true },
    equipped: {
      primary: 'tumo',
      secondary: 'shadow',
      melee: 'thunderblade',
      grenadeType: 'normalgrenade',
      tactical: 'none',
    },
    ownedDragoons: { icesparrow: true },
    equippedDragoon: 'icesparrow',
    weaponXP: { thunder: 350 },
    weaponLevel: { thunder: 3 },
    masterVolume: 0.4,
    musicVolume: 0.25,
    sfxMuted: true,
    musicMuted: false,
    keymap: { moveForward: 'KeyW', weaponSkill: 'KeyE' },
    unlockedDifficulties: { 1: 4, 7: 10 },
    difficultySkipCards: 2,
    ts: 1700000000000,
  });

  it('reads the main save and migrates gold, weapons and loadout', () => {
    const report = migrateLegacySave({ [LEGACY_KEYS.save]: validSave });
    expect(report.migrated).toBe(true);
    expect(report.keysRead).toContain(LEGACY_KEYS.save);
    expect(report.profile.progression.gold).toBe(123456);
    expect(report.profile.progression.ownedWeapons.tumo).toBe(true);
    expect(report.profile.loadout.primary).toBe('tumo');
    expect(report.profile.progression.equippedDragoon).toBe('icesparrow');
    expect(report.profile.progression.weaponLevels.thunder).toBe(3);
    expect(report.profile.progression.weaponXp.thunder).toBe(350);
    expect(report.profile.progression.unlockedDifficulties['1']).toBe(4);
    expect(report.profile.progression.unlockedDifficulties['7']).toBe(10);
    expect(report.profile.progression.difficultySkipCards).toBe(2);
    expect(report.profile.settings.masterVolume).toBeCloseTo(0.4, 5);
    expect(report.profile.settings.sfxMuted).toBe(true);
  });

  it('applies the legacy KeyE -> middle-mouse weapon-skill migration', () => {
    const report = migrateLegacySave({ [LEGACY_KEYS.save]: validSave });
    expect(report.profile.settings.keymap.weaponSkill).toBe('Mouse2');
  });

  it('migrates the character roster together with the main save', () => {
    const report = migrateLegacySave({
      [LEGACY_KEYS.save]: validSave,
      [LEGACY_KEYS.characters]: JSON.stringify({
        owned: { initiate: true, rookie: true },
        frags: 240,
        selected: 'rookie',
      }),
    });
    expect(report.keysRead).toContain(LEGACY_KEYS.characters);
    expect(report.profile.progression.ownedCharacters.rookie).toBe(true);
    expect(report.profile.progression.fragments).toBe(240);
    expect(report.profile.progression.selectedCharacter).toBe('rookie');
  });

  it('falls back to the starter hero when the selected one is not owned', () => {
    const report = migrateLegacySave({
      [LEGACY_KEYS.save]: validSave,
      [LEGACY_KEYS.characters]: JSON.stringify({
        owned: { initiate: true },
        frags: 0,
        selected: 'emperor',
      }),
    });
    expect(report.profile.progression.selectedCharacter).toBe('initiate');
    expect(report.warnings.some((w) => w.includes('emperor'))).toBe(true);
  });

  it('reads the companion key as a bare string, not JSON', () => {
    const report = migrateLegacySave({
      [LEGACY_KEYS.save]: validSave,
      [LEGACY_KEYS.companion]: 'poseidon',
    });
    expect(report.keysRead).toContain(LEGACY_KEYS.companion);
    expect(report.profile.progression.equippedCompanion).toBe('poseidon');
  });

  it('reads the quality preference and keeps the adaptive flag', () => {
    const report = migrateLegacySave({
      [LEGACY_KEYS.save]: validSave,
      [LEGACY_KEYS.quality]: JSON.stringify({ level: 3, adaptive: false }),
    });
    expect(report.profile.settings.qualityLevel).toBe(3);
    expect(report.profile.settings.adaptiveQuality).toBe(false);
  });

  it('reports a corrupt main save instead of losing the profile silently', () => {
    const report = migrateLegacySave({ [LEGACY_KEYS.save]: '{not json' });
    expect(report.keysFailed).toContain(LEGACY_KEYS.save);
    expect(report.warnings.length).toBeGreaterThan(0);
    expect(report.profile.progression.gold).toBe(0);
  });

  it('rejects a save blob without gold or ownedWeapons, like the legacy loader did', () => {
    const report = migrateLegacySave({ [LEGACY_KEYS.save]: JSON.stringify({ somethingElse: 1 }) });
    expect(report.keysFailed).toContain(LEGACY_KEYS.save);
  });

  it('never carries the legacy ts timestamp into the new profile', () => {
    const report = migrateLegacySave({ [LEGACY_KEYS.save]: validSave });
    // `ts` was the vendor cloud conflict key; the rewrite uses `revision`.
    expect((report.profile as unknown as { ts?: number }).ts).toBeUndefined();
    expect(report.profile.revision).toBe(0);
  });

  it('keeps a backup of the original blobs for an undo', () => {
    const report = migrateLegacySave({ [LEGACY_KEYS.save]: validSave });
    expect(report.backup[LEGACY_KEYS.save]).toBe(validSave);
  });

  it('reads every legacy key from a storage-like object', () => {
    const storage = createMemoryStorage({
      [LEGACY_KEYS.save]: validSave,
      [LEGACY_KEYS.characters]: JSON.stringify({ owned: { initiate: true }, frags: 1, selected: 'initiate' }),
      [LEGACY_KEYS.companion]: 'myriad',
      [LEGACY_KEYS.quality]: JSON.stringify({ level: 1, adaptive: true }),
      [LEGACY_KEYS.arenaBest]: JSON.stringify({ wave: 12, kills: 300 }),
      [LEGACY_KEYS.raidBest]: '83.5',
    });
    const snapshot = readLegacySnapshot(storage);
    expect(Object.keys(snapshot)).toHaveLength(6);
    const report = migrateLegacySave(snapshot);
    expect(report.keysRead).toHaveLength(6);
    expect(report.profile.progression.equippedCompanion).toBe('myriad');
  });
});

describe('profile storage', () => {
  it('round-trips a profile through storage', () => {
    const storage = createMemoryStorage();
    const profile = createDefaultProfile(1000);
    profile.progression.gold = 777;
    expect(saveProfile(storage, profile)).toBe(true);

    const loaded = loadProfile(storage);
    expect(loaded.progression.gold).toBe(777);
  });

  it('falls back to the backup when the main document is corrupt', () => {
    const storage = createMemoryStorage();
    const profile = createDefaultProfile(1000);
    profile.progression.gold = 555;
    saveProfile(storage, profile);
    // A second save rolls the first one into the backup slot.
    const next = createDefaultProfile(2000);
    next.progression.gold = 999;
    saveProfile(storage, next);
    storage.setItem(PROFILE_KEY, '{broken');

    const loaded = loadProfile(storage);
    expect(loaded.progression.gold).toBe(555);
  });

  it('does not replace a good backup with a corrupt main document', () => {
    const storage = createMemoryStorage();
    const good = createDefaultProfile(1000);
    good.progression.gold = 111;
    saveProfile(storage, good);
    // A second write rolls the first one into the backup slot.
    const second = createDefaultProfile(1500);
    second.progression.gold = 150;
    saveProfile(storage, second);

    // The main document is corrupted; the backup still holds a good copy.
    storage.setItem(PROFILE_KEY, '{broken main');
    const backupBefore = storage.getItem(PROFILE_BACKUP_KEY);
    expect(backupBefore).toBeTruthy();

    const next = createDefaultProfile(2000);
    next.progression.gold = 222;
    saveProfile(storage, next);

    // The corrupt main must not be promoted into the backup slot.
    expect(storage.getItem(PROFILE_BACKUP_KEY)).toBe(backupBefore);
    expect(JSON.parse(storage.getItem(PROFILE_KEY)!).progression.gold).toBe(222);
  });

  it('returns a usable default when nothing is stored', () => {
    const loaded = loadProfile(createMemoryStorage());
    expect(loaded.progression.gold).toBe(0);
    expect(loaded.loadout.primary).toBe('thunder');
    expect(loaded.schemaVersion).toBe(5);
  });
});
