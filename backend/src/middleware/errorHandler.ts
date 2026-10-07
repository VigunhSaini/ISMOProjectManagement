// backend/src/middleware/errorHandler.ts
// Global error handling middleware — converts AppErrors and unexpected errors
// into a consistent JSON response. No stack traces in production.

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
    return;
  }

  // Prisma unique constraint violation (duplicate email etc)
  if ((err as NodeJS.ErrnoException).code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A record with that value already exists.',
      },
    });
    return;
  }

  // Unknown error — log but don't leak details in production
  if (env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err);
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  });
}

