/**
 * Storage interface used by every route.
 *
 * Two implementations exist:
 *  - `PgDb`      — PostgreSQL (node-postgres), used at runtime.
 *  - `InMemoryDb` — a Map-backed double used by the test-suite, so the route
 *    logic can be exercised without a live database.
 *
 * The interface is intentionally small: it only exposes the operations the
 * HTTP layer needs, and it never leaks SQL into the routes.
 */
import type { PlayerProfile } from '@combat-strike/game-core';

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  createdAt: Date;
}

export interface SessionRow {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ProfileRow {
  userId: string;
  revision: number;
  payload: PlayerProfile;
  updatedAt: Date;
}

/** The authenticated caller, as attached to `request.user`. */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
}

/** Thrown when a unique constraint is violated (duplicate email). */
export class UniqueViolationError extends Error {
  readonly code = '23505';

  constructor(message = 'duplicate key value violates unique constraint') {
    super(message);
    this.name = 'UniqueViolationError';
  }
}

/** True when the error is a PostgreSQL unique-constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
  if (error instanceof UniqueViolationError) return true;
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === '23505'
  );
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName: string | null;
}

export interface CreateSessionInput {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface PutProfileInput {
  userId: string;
  /**
   * The revision the caller believes is stored. A missing row counts as
   * revision 0. The write only happens when the stored revision still
   * matches, which makes the update a compare-and-set.
   */
  expectedRevision: number;
  /** The revision to store. */
  nextRevision: number;
  payload: PlayerProfile;
  updatedAt: Date;
}

export interface Db {
  /** True when the database answers a trivial query. */
  ping(): Promise<boolean>;
  /** Releases every resource held by the implementation. */
  close(): Promise<void>;

  createUser(input: CreateUserInput): Promise<UserRow>;
  findUserByEmail(email: string): Promise<UserRow | null>;
  findUserById(id: string): Promise<UserRow | null>;

  createSession(input: CreateSessionInput): Promise<SessionRow>;
  findSessionById(id: string): Promise<SessionRow | null>;
  deleteSessionById(id: string): Promise<void>;
  deleteExpiredSessions(now: Date): Promise<number>;

  /**
   * Reads the profile row that belongs to `userId`.
   * A profile row belongs to exactly one user; there is no way to read or
   * write another user's row.
   */
  getProfile(userId: string): Promise<ProfileRow | null>;

  /**
   * Compare-and-set write of a profile row.
   *
   * Returns the stored row on success and `null` when the stored revision no
   * longer matches `expectedRevision` (a concurrent write won the race).
   */
  putProfile(input: PutProfileInput): Promise<ProfileRow | null>;
}
