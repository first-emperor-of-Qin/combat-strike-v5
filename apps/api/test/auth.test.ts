import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { bearer, createTestApp, registerUser } from './helpers.js';

describe('auth routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = (await createTestApp()).app;
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a user, logs in and returns the same account on /api/me', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'Pilot@Combat-Strike.local',
        password: 'correct-horse-battery',
        displayName: 'Pilot',
      },
    });
    expect(register.statusCode).toBe(200);
    const registered = register.json() as { token: string; user: { id: string; email: string } };
    expect(registered.token.split('.')).toHaveLength(3);
    expect(registered.user.email).toBe('pilot@combat-strike.local');

    const me = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { authorization: bearer(registered.token) },
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as { user: { id: string; email: string } }).user).toEqual(registered.user);

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'pilot@combat-strike.local', password: 'correct-horse-battery' },
    });
    expect(login.statusCode).toBe(200);
    const loggedIn = login.json() as { token: string; user: { id: string; email: string } };
    expect(loggedIn.user.id).toBe(registered.user.id);

    const meAgain = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { authorization: bearer(loggedIn.token) },
    });
    expect(meAgain.statusCode).toBe(200);
    expect((meAgain.json() as { user: { id: string } }).user.id).toBe(registered.user.id);
  });

  it('rejects a wrong password with 401 and the error envelope', async () => {
    await registerUser(app, 'gunner@combat-strike.local', 'correct-horse-battery');

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'gunner@combat-strike.local', password: 'wrong-password' },
    });

    expect(response.statusCode).toBe(401);
    const body = response.json() as { error: { code: string; message: string } };
    expect(body.error.code).toBe('invalid_credentials');
    expect(typeof body.error.message).toBe('string');
  });

  it('rejects an unknown email with the same envelope', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'nobody@combat-strike.local', password: 'correct-horse-battery' },
    });
    expect(response.statusCode).toBe(401);
    expect((response.json() as { error: { code: string } }).error.code).toBe('invalid_credentials');
  });

  it('refuses to register the same email twice', async () => {
    await registerUser(app, 'dupe@combat-strike.local');
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'dupe@combat-strike.local', password: 'correct-horse-battery' },
    });
    expect(response.statusCode).toBe(409);
    expect((response.json() as { error: { code: string } }).error.code).toBe('email_taken');
  });

  it('rejects a protected route without a token', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/me' });
    expect(response.statusCode).toBe(401);
    expect((response.json() as { error: { code: string } }).error.code).toBe('unauthorized');
  });

  it('invalidates the session on logout', async () => {
    const user = await registerUser(app);
    const logout = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { authorization: bearer(user.token) },
    });
    expect(logout.statusCode).toBe(204);

    const me = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { authorization: bearer(user.token) },
    });
    expect(me.statusCode).toBe(401);
  });
});
