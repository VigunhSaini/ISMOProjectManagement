// backend/tests/setup.ts
// Global test setup: load .env.test if present, else use test defaults

import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment (a separate DB or same DB with test isolation)
config({ path: resolve(__dirname, '../.env.test'), override: false });
config({ path: resolve(__dirname, '../.env'), override: false });

// Ensure we're in test mode
process.env.NODE_ENV = 'test';

// Use a shorter JWT expiry for tests
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

