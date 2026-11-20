/**
 * Fastify application factory.
 *
 * `buildApp()` is exported separately from the server bootstrap so the test
 * suite can inject an in-memory database instead of a live PostgreSQL.
 */
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { loadConfig, type AppConfig } from './config.js';
import { createPgDb, createPool } from './db/pool.js';
import type { Db } from './db/types.js';
import { createAuthenticateHook } from './lib/auth.js';
import { ApiError, type ErrorCode } from './lib/errors.js';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { profileRoutes } from './routes/profile.js';

export interface BuildAppOptions {
  /** Storage layer; defaults to a PostgreSQL pool. */
  db?: Db;
  /** Configuration; read from the environment when omitted. */
  config?: AppConfig;
  /** Overrides the logger; `false` disables request logging entirely. */
  logger?: FastifyServerOptions['logger'];
}

/** Maps a thrown error onto the `{ error: { code, message } }` envelope. */
function errorResponse(code: ErrorCode, message: string): {
  error: { code: ErrorCode; message: string };
} {
  return { error: { code, message } };
}

/** Reads the HTTP status carried by a Fastify error, defaulting to 500. */
function httpStatusOf(error: Error): number {
  const candidate = (error as { statusCode?: unknown }).statusCode;
  if (typeof candidate === 'number' && candidate >= 400 && candidate < 500) return candidate;
  return 500;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const ownsDb = options.db === undefined;
  const db = options.db ?? createPgDb(createPool(config));

  const logger: FastifyServerOptions['logger'] =
    options.logger ?? (config.logLevel === 'silent' ? false : { level: config.logLevel });

  const app = Fastify({
    logger,
    trustProxy: true,
  });

  await app.register(cors, {
    origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindowMs,
    errorResponseBuilder: (_request, context) =>
      errorResponse(
        'rate_limited',
        `Too many requests, retry in ${Math.ceil(Number(context.after) / 1000)}s`,
      ),
  });

  app.decorate('db', db);
  app.decorate('config', config);
  app.decorateRequest('user', null);
  app.decorate('authenticate', createAuthenticateHook({ db, config }));

  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof ApiError) {
      const payload: Record<string, unknown> = {
        error: { code: error.code, message: error.message },
      };
      if (error.details) Object.assign(payload, error.details);
      return reply.status(error.statusCode).send(payload);
    }

    const failure = error instanceof Error ? error : new Error('Unknown error');
    const status = httpStatusOf(failure);

    if (failure.name === 'ZodError') {
      return reply.status(400).send(errorResponse('validation_error', 'Invalid request payload'));
    }

    if (status >= 500) request.log.error({ err: failure }, 'request failed');

    const code: ErrorCode =
      status === 429
        ? 'rate_limited'
        : status === 404
          ? 'not_found'
          : status >= 500
            ? 'internal_error'
            : 'bad_request';
    const message = status >= 500 ? 'Internal server error' : failure.message;
    return reply.status(status).send(errorResponse(code, message));
  });

  await app.register(authRoutes);
  await app.register(profileRoutes);
  await app.register(healthRoutes);

  // When the built frontend is present, serve it from the same origin so a
  // production deployment needs only one domain and one process.
  if (config.staticDir) {
    await app.register(fastifyStatic, {
      root: config.staticDir,
      prefix: '/',
      index: ['index.html'],
      wildcard: false,
    });

    // SPA fallback: any non-API path resolves to the app shell.
    app.setNotFoundHandler(async (request, reply) => {
      if (request.method === 'GET' && !request.url.startsWith('/api/')) {
        return reply.type('text/html').sendFile('index.html');
      }
      return reply
        .status(404)
        .send(errorResponse('not_found', `Route ${request.method} ${request.url} not found`));
    });
  } else {
    app.setNotFoundHandler((request, reply) =>
      reply
        .status(404)
        .send(errorResponse('not_found', `Route ${request.method} ${request.url} not found`)),
    );
  }

  app.addHook('onClose', async () => {
    if (ownsDb) await db.close();
  });

  return app;
}
