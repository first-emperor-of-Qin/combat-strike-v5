/**
 * In-memory implementation of the `Db` interface.
 *
 * Used by the test-suite so the route logic can be exercised without a
 * PostgreSQL server. It mirrors the semantics of `PgDb` exactly, including the
 * compare-and-set behaviour of `putProfile` and the unique-email constraint.
 */
import { randomUUID } from 'node:crypto';
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

function cloneProfile(profile: PlayerProfile): PlayerProfile {
  return structuredClone(profile);
}

export class InMemoryDb implements Db {
  private readonly users = new Map<string, UserRow>();
  private readonly usersByEmail = new Map<string, string>();
  private readonly sessions = new Map<string, SessionRow>();
  private readonly profiles = new Map<string, ProfileRow>();
  private closed = false;

  async ping(): Promise<boolean> {
    return !this.closed;
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  async createUser(input: CreateUserInput): Promise<UserRow> {
    const email = input.email.toLowerCase();
    if (this.usersByEmail.has(email)) {
      throw new UniqueViolationError('email already registered');
    }
    const row: UserRow = {
      id: randomUUID(),
      email,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      createdAt: new Date(),
    };
    this.users.set(row.id, row);
    this.usersByEmail.set(email, row.id);
    return row;
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const id = this.usersByEmail.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) ?? null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    return this.users.get(id) ?? null;
  }

  async createSession(input: CreateSessionInput): Promise<SessionRow> {
    const row: SessionRow = {
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      createdAt: new Date(),
      expiresAt: input.expiresAt,
    };
    this.sessions.set(row.id, row);
    return row;
  }

  async findSessionById(id: string): Promise<SessionRow | null> {
    return this.sessions.get(id) ?? null;
  }

  async deleteSessionById(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async deleteExpiredSessions(now: Date): Promise<number> {
    let removed = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt.getTime() <= now.getTime()) {
        this.sessions.delete(id);
        removed += 1;
      }
    }
    return removed;
  }

  async getProfile(userId: string): Promise<ProfileRow | null> {
    const row = this.profiles.get(userId);
    if (!row) return null;
    return { ...row, payload: cloneProfile(row.payload) };
  }

  async putProfile(input: PutProfileInput): Promise<ProfileRow | null> {
    const current = this.profiles.get(input.userId);
    if (current && current.revision !== input.expectedRevision) return null;
    if (!current && input.expectedRevision !== 0) return null;

    const row: ProfileRow = {
      userId: input.userId,
      revision: input.nextRevision,
      payload: cloneProfile(input.payload),
      updatedAt: input.updatedAt,
    };
    this.profiles.set(input.userId, row);
    return { ...row, payload: cloneProfile(row.payload) };
  }
}
