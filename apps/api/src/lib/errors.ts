/**
 * The single error envelope used by every route:
 *
 *   { "error": { "code": "...", "message": "..." } }
 *
 * Handlers never throw raw Fastify errors — they throw an `ApiError`, and the
 * global error handler in `app.ts` turns it into the envelope. Any extra
 * payload (for example the current profile on a revision conflict) is merged
 * next to the `error` object.
 */

export type ErrorCode =
  | 'validation_error'
  | 'invalid_credentials'
  | 'unauthorized'
  | 'email_taken'
  | 'revision_conflict'
  | 'not_found'
  | 'rate_limited'
  | 'bad_request'
  | 'internal_error';

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
  };
}

/** Extra top-level fields merged into the response next to `error`. */
export type ErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details: ErrorDetails | undefined;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: ErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  /** 400 — the request body or query failed validation. */
  static badRequest(message: string, details?: ErrorDetails): ApiError {
    return new ApiError(400, 'validation_error', message, details);
  }

  /** 401 — no credentials, or the credentials did not match. */
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, 'unauthorized', message);
  }

  /** 401 — email/password pair did not match a user. */
  static invalidCredentials(message = 'Invalid email or password'): ApiError {
    return new ApiError(401, 'invalid_credentials', message);
  }

  /** 409 — the email is already registered. */
  static emailTaken(message = 'That email is already registered'): ApiError {
    return new ApiError(409, 'email_taken', message);
  }

  /** 404 — the resource does not exist. */
  static notFound(message = 'Not found'): ApiError {
    return new ApiError(404, 'not_found', message);
  }

  /** 409 — the client sent a stale `baseRevision`. */
  static revisionConflict(message: string, current: ErrorDetails): ApiError {
    return new ApiError(409, 'revision_conflict', message, { current });
  }
}

/** Serialises an error into the wire envelope. */
export function errorEnvelope(code: ErrorCode, message: string): ErrorEnvelope {
  return { error: { code, message } };
}
