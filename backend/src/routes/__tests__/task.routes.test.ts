import request from 'supertest';
import app from '../../app.js';
import {
  createTestUser,
  createTestProject,
  createTestTask,
  createAuthToken,
} from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';

describe('Task Routes', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ POST /api/v1/columns/:columnId/tasks ============

  describe('POST /api/v1/columns/:columnId/tasks', () => {
    it('creates a task and returns 201', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const columnId = columns[0]!.id;

      const res = await request(app)
        .post(`/api/v1/columns/${columnId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Task',
          description: 'Task description',
          priority: 'HIGH',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('New Task');
      expect(res.body.data.task.priority).toBe('HIGH');
      expect(res.body.data.task.columnId).toBe(columnId);
    });

    it('returns 400 for missing title', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const columnId = columns[0]!.id;

      const res = await request(app)
        .post(`/api/v1/columns/${columnId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 without authentication', async () => {
      const { columns } = await createTestProject();
      const columnId = columns[0]!.id;

      const res = await request(app)
        .post(`/api/v1/columns/${columnId}/tasks`)
        .send({ title: 'Unauthorized Task' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('returns 403 for a non-member', async () => {
      const { columns } = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);
      const columnId = columns[0]!.id;

      const res = await request(app)
        .post(`/api/v1/columns/${columnId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Forbidden Task' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // ============ GET /api/v1/tasks/:taskId ============

  describe('GET /api/v1/tasks/:taskId', () => {
    it('returns 200 with the task for a project member', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        title: 'Findable Task',
      });

      const res = await request(app)
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Findable Task');
      expect(res.body.data.task.id).toBe(task.id);
    });

    it('returns 404 for a non-member', async () => {
      const { owner, columns } = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);
      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const res = await request(app)
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('returns 404 for a non-existent task', async () => {
      const user = await createTestUser();
      const token = createAuthToken(user);

      const res = await request(app)
        .get('/api/v1/tasks/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  // ============ PATCH /api/v1/tasks/:taskId ============

  describe('PATCH /api/v1/tasks/:taskId', () => {
    it('returns 200 when updating a task', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        title: 'Original Title',
      });

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', priority: 'LOW' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Updated Title');
      expect(res.body.data.task.priority).toBe('LOW');
    });

    it('returns 404 for a non-member trying to update', async () => {
      const { owner, columns } = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);
      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hacked Title' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  // ============ DELETE /api/v1/tasks/:taskId ============

  describe('DELETE /api/v1/tasks/:taskId', () => {
    it('returns 200 when soft-deleting a task', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        title: 'Delete Me',
      });

      const res = await request(app)
        .delete(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Task deleted successfully');

      // Verify the task is no longer accessible
      const getRes = await request(app)
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(getRes.body.success).toBe(false);
    });

    it('returns 404 for a non-existent task', async () => {
      const user = await createTestUser();
      const token = createAuthToken(user);

      const res = await request(app)
        .delete('/api/v1/tasks/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  // ============ PATCH /api/v1/tasks/:taskId/move ============

  describe('PATCH /api/v1/tasks/:taskId/move', () => {
    it('returns 200 when moving a task to a different column', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const sourceColumn = columns[0]!; // To Do
      const targetColumn = columns[1]!; // In Progress

      const task = await createTestTask({
        columnId: sourceColumn.id,
        createdById: owner.id,
        title: 'Move Me',
        order: 0,
      });

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetColumnId: targetColumn.id,
          order: 0,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.task.columnId).toBe(targetColumn.id);
      expect(res.body.data.task.order).toBe(0);
    });

    it('returns 400 for missing required fields', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        order: 0,
      });

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/v1/tasks/some-id/move')
        .send({ targetColumnId: 'col-id', order: 0 })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // ============ GET /api/v1/columns/:columnId/tasks ============

  describe('GET /api/v1/columns/:columnId/tasks', () => {
    it('returns 200 with tasks for a project member', async () => {
      const { owner, columns } = await createTestProject();
      const token = createAuthToken(owner);
      const columnId = columns[0]!.id;

      await createTestTask({
        columnId,
        createdById: owner.id,
        title: 'Task A',
        order: 0,
      });
      await createTestTask({
        columnId,
        createdById: owner.id,
        title: 'Task B',
        order: 1,
      });

      const res = await request(app)
        .get(`/api/v1/columns/${columnId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks).toBeInstanceOf(Array);
      expect(res.body.data.tasks.length).toBe(2);
    });

    it('returns 404 for a non-member', async () => {
      const { columns } = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);

      const res = await request(app)
        .get(`/api/v1/columns/${columns[0]!.id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
