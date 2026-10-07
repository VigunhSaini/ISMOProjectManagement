// backend/src/middleware/rateLimit.ts
// Rate limiting middleware for auth endpoints
// Decision: CORS must come before rate limiter so 429 responses still have CORS headers

import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 requests per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts. Please try again in 15 minutes.',
    },
  },
  skipSuccessfulRequests: false,
});

