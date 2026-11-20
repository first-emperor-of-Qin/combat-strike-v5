import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { LEGACY_KEYS, type PlayerProfile } from '@combat-strike/game-core';
import { bearer, createTestApp, registerUser } from './helpers.js';

/** A legacy localStorage export: the six legacy keys, each a JSON string. */
function legacySnapshot(): Record<string, string> {
  return {
    [LEGACY_KEYS.save]: JSON.stringify({
      gold: 4321,
      ownedWeapons: { thunder: true, shadow: true, spectre: true },
      equipped: { primary: 'spectre', secondary: 'shadow', melee: 'thunderblade' },
      equippedDragoon: 'icesparrow',
      weaponLevel: { spectre: 4 },
      weaponXP: { spectre: 120 },
      unlockedDifficulties: { '3': 5 },
      difficultySkipCards: 2,
      masterVolume: 0.4,
    }),
    [LEGACY_KEYS.characters]: JSON.stringify({
      owned: { initiate: true, rookie: true },
      frags: 12,
      selected: 'rookie',
    }),
    [LEGACY_KEYS.companion]: 'myriad',
    [LEGACY_KEYS.quality]: JSON.stringify({ level: 3, adaptive: false }),
    [LEGACY_KEYS.arenaBest]: JSON.stringify({ level: 7 }),
    [LEGACY_KEYS.raidBest]: '12.5',
  };
}

describe('POST /api/profile/import', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = (await createTestApp()).app;
  });

  afterEach(async () => {
    await app.close();
  });

  it('converts a legacy blob and reports which keys were read', async () => {
    const user = await registerUser(app);

    const response = await app.inject({
      method: 'POST',
      url: '/api/profile/import',
      headers: { authorization: bearer(user.token) },
      payload: { legacy: legacySnapshot() },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      profile: PlayerProfile;
      revision: number;
      report: { migrated: boolean; keysRead: string[]; keysFailed: string[]; warnings: string[] };
    };

    expect(body.report.migrated).toBe(true);
    expect(body.report.keysRead).toContain(LEGACY_KEYS.save);
    expect(body.report.keysRead).toContain(LEGACY_KEYS.characters);
    expect(body.report.keysRead).toContain(LEGACY_KEYS.companion);
    expect(body.report.keysFailed).toEqual([]);

    expect(body.profile.progression.gold).toBe(4321);
    expect(body.profile.progression.fragments).toBe(12);
    expect(body.profile.progression.selectedCharacter).toBe('rookie');
    expect(body.profile.progression.equippedCompanion).toBe('myriad');
    expect(body.profile.progression.weaponLevels['spectre']).toBe(4);
    expect(body.profile.loadout.primary).toBe('spectre');
    expect(body.profile.settings.qualityLevel).toBe(3);
    expect(body.revision).toBe(1);

    const read = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
    });
    expect((read.json() as { revision: number }).revision).toBe(1);
  });

  it('reports unreadable blobs instead of failing', async () => {
    const user = await registerUser(app);

    const response = await app.inject({
      method: 'POST',
      url: '/api/profile/import',
      headers: { authorization: bearer(user.token) },
      payload: { legacy: { [LEGACY_KEYS.save]: '{not json', [LEGACY_KEYS.characters]: '{"owned":{}}' } },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      report: { keysRead: string[]; keysFailed: string[]; warnings: string[] };
    };
    expect(body.report.keysFailed).toContain(LEGACY_KEYS.save);
    expect(body.report.keysRead).toContain(LEGACY_KEYS.characters);
    expect(body.report.warnings.length).toBeGreaterThan(0);
  });

  it('requires authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/profile/import',
      payload: { legacy: legacySnapshot() },
    });
    expect(response.statusCode).toBe(401);
  });
});
