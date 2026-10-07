// backend/tests/helpers.ts
// Shared test utilities — app instance, auth tokens, cleanup

import supertest from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/lib/prisma';

export const app = createApp();
export const request = supertest(app);

/** Register a test user and return token + user */
export async function createTestUser(suffix = '') {
  const email = `test${suffix}${Date.now()}@example.com`;
  const res = await request
    .post('/api/auth/register')
    .send({ name: `Test User${suffix}`, email, password: 'Password123!' });
  return { token: res.body.data.token, user: res.body.data.user, email };
}

/** Clean up users created during a test by email pattern */
export async function cleanupTestUsers(emails: string[]) {
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
}

