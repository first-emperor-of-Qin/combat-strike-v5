/**
 * PostgreSQL implementation of the `Db` interface (node-postgres).
 *
 * Every query is parameterised; no SQL is built from user input.
 */
import type { Pool, QueryResultRow } from 'pg';
import type { PlayerProfile } from '@combat-strike/game-core';
import {
  UniqueViolationError,
  type CreateSessionInput,
  type CreateUserInput,
  type Db,
  type ProfileRow,
  type PutProfileInput,
  type SessionRow,
  type UserRow,
} from './types.js';

interface UserDbRow extends QueryResultRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: Date;
}

interface SessionDbRow extends QueryResultRow {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: Date;
  expires_at: Date;
}

interface ProfileDbRow extends QueryResultRow {
  user_id: string;
  revision: number;
  payload: PlayerProfile;
  updated_at: Date;
}

function mapUser(row: UserDbRow): UserRow {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

function mapSession(row: SessionDbRow): SessionRow {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function mapProfile(row: ProfileDbRow): ProfileRow {
  return {
    userId: row.user_id,
    revision: row.revision,
    payload: row.payload,
    updatedAt: row.updated_at,
  };
}

export class PgDb implements Db {
  constructor(private readonly pool: Pool) {}

  async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async createUser(input: CreateUserInput): Promise<UserRow> {
    try {
      const result = await this.pool.query<UserDbRow>(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1, $2, $3)
         RETURNING id, email, password_hash, display_name, created_at`,
        [input.email, input.passwordHash, input.displayName],
      );
      const row = result.rows[0];
      if (!row) throw new Error('user insert returned no row');
      return mapUser(row);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new UniqueViolationError('email already registered');
      }
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const result = await this.pool.query<UserDbRow>(
      `SELECT id, email, password_hash, display_name, created_at
       FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    const row = result.rows[0];
    return row ? mapUser(row) : null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    const result = await this.pool.query<UserDbRow>(
      `SELECT id, email, password_hash, display_name, created_at
       FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );
    const row = result.rows[0];
    return row ? mapUser(row) : null;
  }

  async createSession(input: CreateSessionInput): Promise<SessionRow> {
    const result = await this.pool.query<SessionDbRow>(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, token_hash, created_at, expires_at`,
      [input.id, input.userId, input.tokenHash, input.expiresAt],
    );
    const row = result.rows[0];
    if (!row) throw new Error('session insert returned no row');
    return mapSession(row);
  }

  async findSessionById(id: string): Promise<SessionRow | null> {
    const result = await this.pool.query<SessionDbRow>(
      `SELECT id, user_id, token_hash, created_at, expires_at
       FROM sessions WHERE id = $1 LIMIT 1`,
      [id],
    );
    const row = result.rows[0];
    return row ? mapSession(row) : null;
  }

  async deleteSessionById(id: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE id = $1', [id]);
  }

  async deleteExpiredSessions(now: Date): Promise<number> {
    const result = await this.pool.query('DELETE FROM sessions WHERE expires_at <= $1', [now]);
    return result.rowCount ?? 0;
  }

  async getProfile(userId: string): Promise<ProfileRow | null> {
    const result = await this.pool.query<ProfileDbRow>(
      `SELECT user_id, revision, payload, updated_at
       FROM profiles WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    const row = result.rows[0];
    return row ? mapProfile(row) : null;
  }

  /**
   * Compare-and-set write.
   *
   * The UPDATE only fires when the stored revision still equals
   * `expectedRevision`; when no row exists yet the INSERT only fires when
   * the table has no row for this user. Either way a concurrent writer that
   * already bumped the revision makes this call return `null`.
   */
  async putProfile(input: PutProfileInput): Promise<ProfileRow | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await client.query<ProfileDbRow>(
        `UPDATE profiles
            SET revision = $2, payload = $3, updated_at = $4
          WHERE user_id = $1 AND revision = $5
          RETURNING user_id, revision, payload, updated_at`,
        [input.userId, input.nextRevision, input.payload, input.updatedAt, input.expectedRevision],
      );
      const updatedRow = updated.rows[0];
      if (updatedRow) {
        await client.query('COMMIT');
        return mapProfile(updatedRow);
      }

      const inserted = await client.query<ProfileDbRow>(
        `INSERT INTO profiles (user_id, revision, payload, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING user_id, revision, payload, updated_at`,
        [input.userId, input.nextRevision, input.payload, input.updatedAt],
      );
      const insertedRow = inserted.rows[0];
      await client.query('COMMIT');
      return insertedRow ? mapProfile(insertedRow) : null;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // The connection is already broken; the original error matters more.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
