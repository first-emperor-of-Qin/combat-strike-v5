# =============================================================================
# 枪战突击 · COMBAT STRIKE — production image
#
# A single image serves both the static frontend and the API, so a
# single-domain deployment only needs one container and one Postgres.
# =============================================================================
FROM node:22-alpine AS base
WORKDIR /app
# NODE_ENV is only set for the runtime stage. Setting it here would make
# `npm ci` skip devDependencies, and the build stage needs the TypeScript
# compiler.
RUN apk add --no-cache tini

# ---------------------------------------------------------------- deps
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/content/package.json packages/content/
COPY packages/game-core/package.json packages/game-core/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspaces --include-workspace-root --include=dev

# ---------------------------------------------------------------- build
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/content packages/content
COPY packages/game-core packages/game-core
COPY apps/api apps/api
COPY apps/web apps/web
RUN npm run build -w @combat-strike/content \
 && npm run build -w @combat-strike/game-core \
 && npm run build -w @combat-strike/api \
 && npm run build -w @combat-strike/web

# ---------------------------------------------------------------- runtime
FROM base AS runtime
ENV NODE_ENV=production

# A fresh production-only install keeps the runtime image small: the build
# stage installed the full toolchain, which the runtime does not need.
COPY package.json package-lock.json ./
COPY packages/content/package.json packages/content/
COPY packages/game-core/package.json packages/game-core/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspaces --include-workspace-root --omit=dev && npm cache clean --force

COPY --from=build /app/packages/content/package.json packages/content/
COPY --from=build /app/packages/content/dist packages/content/dist
COPY --from=build /app/packages/game-core/package.json packages/game-core/
COPY --from=build /app/packages/game-core/dist packages/game-core/dist
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/migrations apps/api/migrations
COPY --from=build /app/apps/web/dist apps/web/dist

# The API serves the built frontend as static files from the same origin.
ENV API_STATIC_DIR=/app/apps/web/dist
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/api/dist/server.js"]
