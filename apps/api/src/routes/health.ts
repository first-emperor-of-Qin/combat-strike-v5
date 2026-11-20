/**
 * Health endpoint — used by the compose healthcheck and by the client to
 * know whether the API can reach its database.
 */
import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/health', async (_request, reply) => {
    const dbUp = await app.db.ping();
    return reply.status(dbUp ? 200 : 503).send({
      status: dbUp ? 'ok' : 'degraded',
      db: dbUp ? 'up' : 'down',
      version: app.config.version,
    });
  });
};
