import type { AppConfig } from './config.js';
import type { AuthUser, Db } from './db/types.js';
import type { preHandlerHookHandler } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    /** The authenticated caller, or `null` on public routes. */
    user: AuthUser | null;
  }
  interface FastifyInstance {
    /** The storage layer the routes operate on. */
    db: Db;
    /** The resolved configuration. */
    config: AppConfig;
    /** preHandler that rejects requests without a valid session. */
    authenticate: preHandlerHookHandler;
  }
}
