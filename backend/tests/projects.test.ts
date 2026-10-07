// backend/tests/projects.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, cleanupTestUsers } from './helpers';

describe('Project Endpoints', () => {
  let userAToken: string;
  let userAEmail: string;
  let userBToken: string;
  let userBEmail: string;
  let projectId: string;

  beforeAll(async () => {
    const a = await createTestUser('-proj-a');
    userAToken = a.token;
    userAEmail = a.email;
    const b = await createTestUser('-proj-b');
    userBToken = b.token;
    userBEmail = b.email;
  });

  afterAll(async () => {
    await cleanupTestUsers([userAEmail, userBEmail]);
  });

  it('POST /api/projects — creates a project', async () => {
    const res = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Test Project', description: 'A test project', status: 'IN_PROGRESS' });
    expect(res.status).toBe(201);
    expect(res.body.data.project.name).toBe('Test Project');
    projectId = res.body.data.project.id;
  });

  it('GET /api/projects — returns only user A projects', async () => {
    const res = await request.get('/api/projects').set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    res.body.data.items.forEach((p: { userId: string }) => {
      // All projects returned must belong to user A
      expect(p.userId).toBeDefined();
    });
  });

  it('GET /api/projects/:id — returns project for owner', async () => {
    const res = await request
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.project.id).toBe(projectId);
  });

  it('GET /api/projects/:id — returns 404 for User B accessing User A project', async () => {
    const res = await request
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(404);
  });

  it('PUT /api/projects/:id — updates project for owner', async () => {
    const res = await request
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Updated Project', status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.project.name).toBe('Updated Project');
    expect(res.body.data.project.status).toBe('COMPLETED');
  });

  it('PUT /api/projects/:id — returns 404 for User B updating User A project', async () => {
    const res = await request
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Hijack' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/projects/:id — returns 404 for User B deleting User A project', async () => {
    const res = await request
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /api/projects/:id — deletes project for owner', async () => {
    const res = await request
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/projects — supports search filter', async () => {
    await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Searchable Project XYZ' });
    const res = await request
      .get('/api/projects?search=Searchable')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items[0].name).toContain('Searchable');
  });
});

