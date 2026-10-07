// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema } from '../shared/schemas/auth';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), AuthController.login);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;

