import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createDefaultProfile, type PlayerProfile } from '@combat-strike/game-core';
import { bearer, createTestApp, registerUser } from './helpers.js';

/** A valid profile with one field changed, so two payloads never compare equal. */
function profileWithGold(gold: number): PlayerProfile {
  const profile = createDefaultProfile();
  profile.progression.gold = gold;
  return profile;
}

describe('profile routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = (await createTestApp()).app;
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns the default profile with revision 0 when nothing was saved yet', async () => {
    const user = await registerUser(app);
    const response = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { profile: PlayerProfile; revision: number };
    expect(body.revision).toBe(0);
    expect(body.profile.progression.gold).toBe(0);
    expect(body.profile.schemaVersion).toBeGreaterThan(0);
  });

  it('stores a profile and returns revision 1', async () => {
    const user = await registerUser(app);
    const profile = profileWithGold(1234);

    const response = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
      payload: { profile, baseRevision: 0 },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { profile: PlayerProfile; revision: number };
    expect(body.revision).toBe(1);
    expect(body.profile.progression.gold).toBe(1234);
    expect(body.profile.revision).toBe(1);

    const read = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
    });
    const readBody = read.json() as { profile: PlayerProfile; revision: number };
    expect(readBody.revision).toBe(1);
    expect(readBody.profile.progression.gold).toBe(1234);
  });

  it('rejects a stale baseRevision with 409 and returns the current profile', async () => {
    const user = await registerUser(app);
    await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
      payload: { profile: profileWithGold(100), baseRevision: 0 },
    });

    const response = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
      payload: { profile: profileWithGold(200), baseRevision: 0 },
    });

    expect(response.statusCode).toBe(409);
    const body = response.json() as {
      error: { code: string; message: string };
      current: { profile: PlayerProfile; revision: number };
    };
    expect(body.error.code).toBe('revision_conflict');
    expect(typeof body.error.message).toBe('string');
    expect(body.current.revision).toBe(1);
    expect(body.current.profile.progression.gold).toBe(100);
  });

  it('does not bump the revision when the payload is unchanged', async () => {
    const user = await registerUser(app);
    const profile = profileWithGold(777);

    const first = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
      payload: { profile, baseRevision: 0 },
    });
    expect((first.json() as { revision: number }).revision).toBe(1);

    const second = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
      payload: { profile, baseRevision: 1 },
    });

    expect(second.statusCode).toBe(200);
    expect((second.json() as { revision: number }).revision).toBe(1);
  });

  it('keeps one user out of another user profile', async () => {
    const alice = await registerUser(app, 'alice@combat-strike.local');
    const bob = await registerUser(app, 'bob@combat-strike.local');

    await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(alice.token) },
      payload: { profile: profileWithGold(5000), baseRevision: 0 },
    });

    // Bob sees his own (empty) profile, never Alice's.
    const bobRead = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: bearer(bob.token) },
    });
    const bobBody = bobRead.json() as { profile: PlayerProfile; revision: number };
    expect(bobBody.revision).toBe(0);
    expect(bobBody.profile.progression.gold).toBe(0);

    // Bob writes his own profile; Alice's row must stay untouched.
    await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(bob.token) },
      payload: { profile: profileWithGold(42), baseRevision: 0 },
    });

    const aliceRead = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: bearer(alice.token) },
    });
    const aliceBody = aliceRead.json() as { profile: PlayerProfile; revision: number };
    expect(aliceBody.revision).toBe(1);
    expect(aliceBody.profile.progression.gold).toBe(5000);
  });

  it('rejects a profile with unknown fields', async () => {
    const user = await registerUser(app);
    const profile = profileWithGold(10) as PlayerProfile & { hackerMode?: boolean };
    profile.hackerMode = true;

    const response = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: bearer(user.token) },
      payload: { profile, baseRevision: 0 },
    });

    expect(response.statusCode).toBe(400);
    expect((response.json() as { error: { code: string } }).error.code).toBe('validation_error');
  });

  it('requires authentication', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/profile' });
    expect(response.statusCode).toBe(401);
    expect((response.json() as { error: { code: string } }).error.code).toBe('unauthorized');
  });
});
