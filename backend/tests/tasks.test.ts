// backend/tests/tasks.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, cleanupTestUsers } from './helpers';

describe('Task Endpoints', () => {
  let userAToken: string;
  let userAEmail: string;
  let userBToken: string;
  let userBEmail: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const a = await createTestUser('-task-a');
    userAToken = a.token;
    userAEmail = a.email;
    const b = await createTestUser('-task-b');
    userBToken = b.token;
    userBEmail = b.email;

    // Create a project for User A
    const projRes = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Task Test Project' });
    projectId = projRes.body.data.project.id;
  });

  afterAll(async () => {
    await cleanupTestUsers([userAEmail, userBEmail]);
  });

  it('POST /api/tasks — creates a task under user A project', async () => {
    const res = await request
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Test Task', priority: 'HIGH', projectId });
    expect(res.status).toBe(201);
    expect(res.body.data.task.name).toBe('Test Task');
    expect(res.body.data.task.priority).toBe('HIGH');
    taskId = res.body.data.task.id;
  });

  it('POST /api/tasks — rejects creating task in another user project', async () => {
    const res = await request
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Hijack Task', projectId });
    expect(res.status).toBe(404); // Project not found for user B
  });

  it('GET /api/tasks — returns only user A tasks', async () => {
    const res = await request.get('/api/tasks').set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('GET /api/tasks/:id — returns 404 for User B accessing User A task', async () => {
    const res = await request
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(404);
  });

  it('PUT /api/tasks/:id — updates task status', async () => {
    const res = await request
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('COMPLETED');
  });

  it('PUT /api/tasks/:id — returns 404 for User B updating User A task', async () => {
    const res = await request
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ status: 'PENDING' });
    expect(res.status).toBe(404);
  });

  it('GET /api/tasks — supports status filter', async () => {
    const res = await request
      .get('/api/tasks?status=COMPLETED')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    res.body.data.items.forEach((t: { status: string }) => {
      expect(t.status).toBe('COMPLETED');
    });
  });

  it('DELETE /api/tasks/:id — deletes task for owner', async () => {
    const res = await request
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
  });
});

