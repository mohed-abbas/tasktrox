import request from 'supertest';
import app from '../../app.js';
import {
  createTestUser,
  createTestProject,
  createAuthToken,
} from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';

describe('Project Routes', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ GET /api/v1/projects ============

  describe('GET /api/v1/projects', () => {
    it('returns 200 with projects for authenticated user', async () => {
      const { owner } = await createTestProject({ name: 'My Project' });
      const token = createAuthToken(owner);

      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.projects).toBeInstanceOf(Array);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].name).toBe('My Project');
    });

    it('returns 200 with empty array for user with no projects', async () => {
      const user = await createTestUser();
      const token = createAuthToken(user);

      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.projects).toEqual([]);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ============ POST /api/v1/projects ============

  describe('POST /api/v1/projects', () => {
    it('creates a project and returns 201', async () => {
      const user = await createTestUser();
      const token = createAuthToken(user);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Project' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.project.name).toBe('New Project');
      expect(res.body.data.project.ownerId).toBe(user.id);
      // Should have default columns
      expect(res.body.data.project.columns).toBeDefined();
      expect(res.body.data.project.columns.length).toBe(4);
    });

    it('creates a project with custom color', async () => {
      const user = await createTestUser();
      const token = createAuthToken(user);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Colored Project', color: '#ff0000' })
        .expect(201);

      expect(res.body.data.project.color).toBe('#ff0000');
    });

    it('returns 400 for missing name', async () => {
      const user = await createTestUser();
      const token = createAuthToken(user);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .send({ name: 'Unauthorized Project' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // ============ GET /api/v1/projects/:projectId ============

  describe('GET /api/v1/projects/:projectId', () => {
    it('returns 200 with project for a member', async () => {
      const { owner, ...project } = await createTestProject({
        name: 'Accessible',
      });
      const token = createAuthToken(owner);

      const res = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.project.name).toBe('Accessible');
      expect(res.body.data.project.columns).toBeDefined();
      expect(res.body.data.project.members).toBeDefined();
    });

    it('returns 404 for a non-member', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);

      const res = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PROJECT_NOT_FOUND');
    });
  });

  // ============ PATCH /api/v1/projects/:projectId ============

  describe('PATCH /api/v1/projects/:projectId', () => {
    it('returns 200 when owner updates project', async () => {
      const { owner, ...project } = await createTestProject({
        name: 'Old Name',
      });
      const token = createAuthToken(owner);

      const res = await request(app)
        .patch(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name', color: '#00ff00' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.project.name).toBe('New Name');
      expect(res.body.data.project.color).toBe('#00ff00');
    });

    it('returns 403 when non-owner tries to update', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);

      const res = await request(app)
        .patch(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked Name' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ============ DELETE /api/v1/projects/:projectId ============

  describe('DELETE /api/v1/projects/:projectId', () => {
    it('returns 200 when owner deletes project', async () => {
      const { owner, ...project } = await createTestProject();
      const token = createAuthToken(owner);

      const res = await request(app)
        .delete(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Project deleted successfully');

      // Verify the project is no longer accessible
      const getRes = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(getRes.body.success).toBe(false);
    });

    it('returns 403 when non-owner tries to delete', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();
      const token = createAuthToken(nonMember);

      const res = await request(app)
        .delete(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
