# @combat-strike/api

Backend for 枪战突击 · COMBAT STRIKE — Fastify 5 + PostgreSQL 16 + TypeScript (ESM).

It owns the two things the browser game cannot own safely: the **account** and
the **single save file**. The save is stored as one versioned document with a
monotonic revision, so two open tabs (or a phone and a PC) can never silently
overwrite each other.

---

## Run it locally

```bash
# 0. one-time: install the workspace dependencies
npm install

# 1. create the .env file
cp .env.example .env

# 2. start PostgreSQL (data lives in the `combat-strike-pgdata` volume)
docker compose up -d

# 3. create the schema
npm run db:migrate

# 4. create the demo account (optional but handy)
npm run db:seed

# 5. run the API
npm run dev            # http://localhost:3001
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build -w @combat-strike/api` | compiles `src/` into `dist/` |
| `npm run start -w @combat-strike/api` | runs the compiled server |
| `npm run test -w @combat-strike/api` | runs the vitest suite (no database needed) |
| `npm run typecheck -w @combat-strike/api` | type-checks `src/` **and** `test/` |
| `npm run db:migrate -w @combat-strike/api` | applies `migrations/*.sql` |
| `npm run db:seed -w @combat-strike/api` | creates the demo account |

`build`, `test` and `typecheck` first make sure `@combat-strike/game-core` is
built (`scripts/ensure-game-core.mjs`); the API imports the profile schema and
the legacy migration from that package.

### Environment

Every variable the API reads is documented in the repository root
[`.env.example`](../../.env.example). In `NODE_ENV=production` the API refuses
to start without `DATABASE_URL` and a `JWT_SECRET` of at least 32 characters.

---

## Endpoints

All responses are JSON. Every failure — validation, authentication, conflict,
rate limit, unknown route — uses the same envelope:

```json
{ "error": { "code": "validation_error", "message": "…" } }
```

Error codes: `validation_error`, `invalid_credentials`, `unauthorized`,
`email_taken`, `revision_conflict`, `not_found`, `rate_limited`,
`bad_request`, `internal_error`.

Authenticated routes expect `Authorization: Bearer <token>`.

### `POST /api/auth/register`

```jsonc
// request
{ "email": "pilot@combat-strike.local", "password": "correct-horse-battery", "displayName": "Pilot" }
```

`displayName` is optional; the password must be 8–128 characters.

```jsonc
// 200
{ "token": "<jwt>", "user": { "id": "…", "email": "pilot@combat-strike.local", "displayName": "Pilot", "createdAt": "2026-01-01T00:00:00.000Z" } }
```

`409 email_taken` when the email is already registered, `400 validation_error`
for a malformed body.

### `POST /api/auth/login`

```jsonc
// request
{ "email": "pilot@combat-strike.local", "password": "correct-horse-battery" }
```

`200` with the same `{ token, user }` shape as register.
`401 invalid_credentials` for a wrong password **and** for an unknown email —
the two are indistinguishable on purpose.

### `POST /api/auth/logout` 🔒

Deletes the session behind the presented token. `204` with an empty body.
The token stops working immediately.

### `GET /api/me` 🔒

```jsonc
// 200
{ "user": { "id": "…", "email": "pilot@combat-strike.local", "displayName": "Pilot", "createdAt": "…" } }
```

### `GET /api/profile` 🔒

```jsonc
// 200 — nothing saved yet
{ "profile": { "schemaVersion": 5, "revision": 0, "progression": { … }, "loadout": { … }, "settings": { … }, "stats": {} }, "revision": 0 }
```

When the account has never saved a profile the API answers `200` with the
default profile and `revision: 0` — it never creates a row on a read.

### `PUT /api/profile` 🔒

```jsonc
// request
{
  "profile": { "schemaVersion": 5, "revision": 0, "updatedAt": 0, "progression": { … }, "loadout": { … }, "settings": { … }, "stats": {} },
  "baseRevision": 0
}
```

`baseRevision` is the revision the client last read. The profile is validated
against the canonical schema from `@combat-strike/game-core`
(`profileSchema`), **including a rejection of unknown fields** — a typo in a
field name is an error, not a silently dropped value.

```jsonc
// 200
{ "profile": { …, "revision": 1, "updatedAt": 1770000000000 }, "revision": 1 }
```

The server owns `schemaVersion`, `revision` and `updatedAt`; whatever the
client sends for those three is replaced.

#### Conflict semantics (`409 revision_conflict`)

The client sends the revision it last saw (`baseRevision`). If the stored
revision is different, the write is refused and the current state is returned
so the client can ask the player what to do:

```jsonc
// 409
{
  "error": { "code": "revision_conflict", "message": "The profile was modified by another client; reload before saving again." },
  "current": { "profile": { …, "revision": 3 }, "revision": 3 }
}
```

The check and the write are a single compare-and-set
(`UPDATE … WHERE revision = $expected`), so two concurrent writers can never
both win.

#### Idempotency

If the incoming payload carries **the same content** as the stored profile,
the revision is **not** bumped and the stored revision is returned unchanged.
A retried request is therefore a no-op:

```jsonc
// PUT #1  { profile: …, baseRevision: 0 }  -> 200 { revision: 1 }
// PUT #2  { profile: …, baseRevision: 1 }  -> 200 { revision: 1 }   (no bump)
// PUT #3  { profile: …, baseRevision: 1 }  -> 200 { revision: 1 }   (no bump)
```

The comparison ignores `revision` and `updatedAt` (the server owns them), so a
client that re-sends the same game state from another device never creates a
spurious revision.

### `POST /api/profile/import` 🔒

Converts a legacy localStorage export into the new profile format with
`migrateLegacySave()` from `@combat-strike/game-core`.

```jsonc
// request
{
  "legacy": {
    "cs_save_v2": "{\"gold\":1200,\"ownedWeapons\":{\"thunder\":true}}",
    "cs_characters_v1": "{\"owned\":{\"initiate\":true},\"frags\":3}",
    "cs_companion_v1": "myriad",
    "cs_quality_pref_v1": "{\"level\":2}",
    "cs_arena_best_v1": "{\"level\":7}",
    "cs_raid_best_v1": "12.5"
  }
}
```

```jsonc
// 200
{
  "profile": { … },
  "revision": 1,
  "report": {
    "migrated": true,
    "keysRead": ["cs_save_v2", "cs_characters_v1", "cs_companion_v1"],
    "keysFailed": [],
    "warnings": [],
    "backup": { … }
  }
}
```

`keysFailed` lists the blobs that could not be parsed and `warnings` explains
what was dropped — a broken blob never aborts the import. The result is
stored like any other profile write (same conflict and idempotency rules).

The same conversion is available offline:

```bash
node tools/migrate-legacy-save.mjs path/to/legacy-export.json --pretty
```

### `GET /api/health`

```jsonc
// 200
{ "status": "ok", "db": "up", "version": "5.1.0" }
```

`503` with `{ "status": "degraded", "db": "down" }` when the database cannot
be reached.

---

## Data model

| Table | Purpose |
| --- | --- |
| `users` | account: `email` (citext), `password_hash` (scrypt), `display_name` |
| `sessions` | one row per logged-in device, storing only the SHA-256 hash of the token |
| `profiles` | one row per user (`user_id` is the primary key): `revision`, `payload` (jsonb), `updated_at` |

A profile row belongs to exactly one user: `profiles.user_id` references
`users.id` with `ON DELETE CASCADE`, and every query is scoped by the
authenticated user's id. One account can never read or overwrite another
account's profile.

Passwords are hashed with Node's built-in **scrypt** (random salt per user,
timing-safe comparison) — no native addon, nothing to compile. Session tokens
are HS256 JWTs signed with `JWT_SECRET`; the database only ever sees their
SHA-256 hash.

### Migrations

`migrations/*.sql` are applied in file-name order and recorded in
`schema_migrations` (with a checksum). A PostgreSQL advisory lock serialises
concurrent instances, so running `npm run db:migrate` twice — or on two
machines at once — is safe: the second run waits and then finds everything
applied.

---

## Backup and restore

The database lives in the named volume `combat-strike-pgdata`.

**Logical backup (recommended)**

```bash
# dump
docker compose exec -T postgres pg_dump -U postgres -d combat_strike --format=custom > combat-strike-$(date +%F).dump

# restore into an empty database
docker compose exec -T postgres dropdb -U postgres --if-exists combat_strike
docker compose exec -T postgres createdb -U postgres combat_strike
docker compose exec -T postgres pg_restore -U postgres -d combat_strike --clean --if-exists < combat-strike-2026-01-01.dump
```

**Volume snapshot (whole cluster, no downtime window needed beyond the copy)**

```bash
# find the exact volume name
docker volume ls | grep combat-strike

# snapshot
docker run --rm \
  -v combat-strike-pgdata:/data:ro \
  -v "$PWD":/backup \
  alpine tar czf /backup/combat-strike-pgdata-$(date +%F).tar.gz -C /data .

# restore (overwrites the volume contents)
docker compose down
docker run --rm \
  -v combat-strike-pgdata:/data \
  -v "$PWD":/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/combat-strike-pgdata-2026-01-01.tar.gz -C /data"
docker compose up -d
```

**Stop the volume** with `docker compose down` (keeps the data) and remove it
permanently with `docker compose down -v`.

---

## Tests

```bash
npm run test -w @combat-strike/api
```

The suite runs against `InMemoryDb`, an in-memory implementation of the same
`Db` interface the PostgreSQL implementation uses — **no database server is
required**. It covers the register → login → `/api/me` round trip, wrong
passwords, profile writes and revisions, the 409 conflict, idempotent writes,
profile ownership between two accounts, the legacy import and the health
endpoint.
