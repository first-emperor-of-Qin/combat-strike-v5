import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from './helpers.js';

describe('GET /api/health', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = (await createTestApp()).app;
  });

  afterEach(async () => {
    await app.close();
  });

  it('reports the database state and the api version', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; db: string; version: string };
    expect(body.status).toBe('ok');
    expect(body.db).toBe('up');
    expect(typeof body.version).toBe('string');
    expect(body.version.length).toBeGreaterThan(0);
  });

  it('returns the error envelope for an unknown route', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/nope' });
    expect(response.statusCode).toBe(404);
    expect((response.json() as { error: { code: string } }).error.code).toBe('not_found');
  });
});
