// backend/src/middleware/auth.ts
// JWT authentication middleware — attaches verified user to req.user

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import { UnauthorizedError } from '../lib/errors';

// Extend Express Request type to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No authentication token provided.', 'MISSING_TOKEN'));
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

