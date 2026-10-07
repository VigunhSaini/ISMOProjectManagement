// backend/src/lib/errors.ts
// Structured application error classes used throughout the API

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Auth Errors ──────────────────────────────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super('Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
}

// ─── Resource Errors ──────────────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, 404, 'NOT_FOUND');
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('You do not have permission to perform this action.', 403, 'FORBIDDEN');
  }
}

// ─── Validation / Conflict Errors ────────────────────────────────────────
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT', undefined);
  }
}

