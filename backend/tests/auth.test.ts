// backend/tests/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, cleanupTestUsers } from './helpers';

describe('Auth Endpoints', () => {
  const emails: string[] = [];

  afterAll(async () => {
    await cleanupTestUsers(emails);
  });

  it('POST /api/auth/register — creates a user and returns token', async () => {
    const email = `auth-reg-${Date.now()}@test.com`;
    emails.push(email);
    const res = await request.post('/api/auth/register').send({
      name: 'Auth Test',
      email,
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('POST /api/auth/register — rejects duplicate email', async () => {
    const email = `auth-dup-${Date.now()}@test.com`;
    emails.push(email);
    await request.post('/api/auth/register').send({ name: 'Dup', email, password: 'Password123!' });
    const res = await request.post('/api/auth/register').send({ name: 'Dup', email, password: 'Password123!' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register — rejects weak password', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Weak',
      email: 'weak@test.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/login — returns token on valid credentials', async () => {
    const email = `auth-login-${Date.now()}@test.com`;
    emails.push(email);
    await request.post('/api/auth/register').send({ name: 'Login Test', email, password: 'Password123!' });
    const res = await request.post('/api/auth/login').send({ email, password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    const email = `auth-wrongpw-${Date.now()}@test.com`;
    emails.push(email);
    await request.post('/api/auth/register').send({ name: 'Wrong PW', email, password: 'Password123!' });
    const res = await request.post('/api/auth/login').send({ email, password: 'wrongpassword1' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me — returns user profile with valid token', async () => {
    const email = `auth-me-${Date.now()}@test.com`;
    emails.push(email);
    const reg = await request.post('/api/auth/register').send({ name: 'Me Test', email, password: 'Password123!' });
    const token = reg.body.data.token;
    const res = await request.get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });

  it('GET /api/auth/me — rejects missing token', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — rejects malformed token', async () => {
    const res = await request.get('/api/auth/me').set('Authorization', 'Bearer not-a-valid-token');
    expect(res.status).toBe(401);
  });
});

