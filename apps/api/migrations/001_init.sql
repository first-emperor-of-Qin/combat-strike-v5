-- Combat Strike — initial schema.
--
-- Three tables:
--   users     — the account (email + scrypt password hash)
--   sessions  — one row per logged-in device, storing only the token hash
--   profiles  — one profile row per user, with a monotonic revision
--
-- A profile row belongs to exactly one user: `profiles.user_id` is the
-- primary key and references `users.id`, so a profile can never be shared or
-- orphaned.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id   uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  revision  integer NOT NULL DEFAULT 0,
  payload   jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sessions are looked up by user (logout-everywhere) and swept by expiry.
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

-- Supports "most recently updated profile" admin queries.
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON profiles (updated_at);

-- A profile payload is never empty.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_payload_is_object') THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_payload_is_object CHECK (jsonb_typeof(payload) = 'object');
  END IF;
END
$$;
