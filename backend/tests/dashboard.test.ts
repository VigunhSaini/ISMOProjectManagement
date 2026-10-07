// backend/tests/dashboard.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, cleanupTestUsers } from './helpers';

describe('Dashboard Endpoint', () => {
  let token: string;
  let email: string;

  beforeAll(async () => {
    const u = await createTestUser('-dash');
    token = u.token;
    email = u.email;

    // Create 2 projects and 3 tasks
    const p1 = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dash Project 1', status: 'IN_PROGRESS' });
    const p2 = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dash Project 2', status: 'COMPLETED' });

    await request.post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Task 1', projectId: p1.body.data.project.id, status: 'COMPLETED' });
    await request.post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Task 2', projectId: p1.body.data.project.id, status: 'PENDING' });
    await request.post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Task 3', projectId: p2.body.data.project.id, status: 'IN_PROGRESS' });
  });

  afterAll(async () => {
    await cleanupTestUsers([email]);
  });

  it('GET /api/dashboard — returns correct stats', async () => {
    const res = await request.get('/api/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const { stats } = res.body.data;
    expect(stats.totalProjects).toBe(2);
    expect(stats.totalTasks).toBe(3);
    expect(stats.completedTasks).toBe(1);
    expect(stats.pendingTasks).toBe(1);
    expect(stats.inProgressTasks).toBe(1);
    expect(stats.projectsInProgress).toBe(1);
    expect(stats.completedProjects).toBe(1);
  });

  it('GET /api/dashboard — requires authentication', async () => {
    const res = await request.get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});

