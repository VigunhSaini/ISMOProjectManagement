// backend/src/app.ts
// Express application factory — middleware pipeline and route mounting
// Middleware order is critical — documented with rationale

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';

import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // ─── 1. Trust proxy (required for Render/Railway — rate limiter uses real IP) ──
  app.set('trust proxy', 1);

  // ─── 2. CORS — must come BEFORE rate limiter so 429 responses include CORS headers ──
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ─── 3. Security headers ────────────────────────────────────────────────────
  app.use(helmet());

  // ─── 4. Request logging ─────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // ─── 5. Body parsing ────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ─── 6. Health check (no auth, no logging) ──────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── 7. API Routes ──────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // ─── 8. 404 and Error handlers (must be last) ───────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

