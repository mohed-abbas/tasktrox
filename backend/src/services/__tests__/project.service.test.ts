import { ProjectService } from '../project.service.js';
import { createTestUser, createTestProject } from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';

describe('ProjectService', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ createProject ============

  describe('createProject', () => {
    it('creates a project with default columns and owner membership', async () => {
      const user = await createTestUser();

      const project = await ProjectService.createProject(user.id, {
        name: 'Test Project',
      });

      expect(project).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.ownerId).toBe(user.id);
      expect(project.color).toBe('#6366f1'); // default color

      // Should have default columns
      expect(project.columns).toBeDefined();
      expect(project.columns!.length).toBe(4); // To Do, In Progress, Review, Done
      expect(project.columns![0]!.name).toBe('To Do');
      expect(project.columns![1]!.name).toBe('In Progress');
      expect(project.columns![2]!.name).toBe('Review');
      expect(project.columns![3]!.name).toBe('Done');

      // Should have owner membership
      expect(project.members).toBeDefined();
      expect(project.members!.length).toBe(1);
      expect(project.members![0]!.user.id).toBe(user.id);
    });

    it('creates a project with a custom color', async () => {
      const user = await createTestUser();

      const project = await ProjectService.createProject(user.id, {
        name: 'Colored Project',
        color: '#ff0000',
      });

      expect(project.color).toBe('#ff0000');
    });
  });

  // ============ getUserProjects ============

  describe('getUserProjects', () => {
    it('returns projects for the owner', async () => {
      const { owner } = await createTestProject({ name: 'Project A' });
      await createTestProject({ ownerId: owner.id, name: 'Project B' });

      const projects = await ProjectService.getUserProjects(owner.id);

      expect(projects.length).toBe(2);
      const names = projects.map((p) => p.name);
      expect(names).toContain('Project A');
      expect(names).toContain('Project B');
    });

    it('returns empty array for user with no projects', async () => {
      const user = await createTestUser();

      const projects = await ProjectService.getUserProjects(user.id);

      expect(projects).toEqual([]);
    });
  });

  // ============ getProjectById ============

  describe('getProjectById', () => {
    it('returns project for a member', async () => {
      const { owner, ...project } = await createTestProject({
        name: 'Accessible Project',
      });

      const result = await ProjectService.getProjectById(project.id, owner.id);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Accessible Project');
      expect(result!.columns).toBeDefined();
      expect(result!.members).toBeDefined();
    });

    it('returns null for a non-member', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();

      const result = await ProjectService.getProjectById(project.id, nonMember.id);

      expect(result).toBeNull();
    });
  });

  // ============ updateProject ============

  describe('updateProject', () => {
    it('allows the owner to update name and color', async () => {
      const { owner, ...project } = await createTestProject({ name: 'Old Name' });

      const updated = await ProjectService.updateProject(project.id, owner.id, {
        name: 'New Name',
        color: '#00ff00',
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('New Name');
      expect(updated!.color).toBe('#00ff00');
    });

    it('returns null when non-owner tries to update', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();

      const result = await ProjectService.updateProject(project.id, nonMember.id, {
        name: 'Hacked Name',
      });

      expect(result).toBeNull();
    });
  });

  // ============ deleteProject ============

  describe('deleteProject', () => {
    it('soft-deletes the project for the owner', async () => {
      const { owner, ...project } = await createTestProject();

      const success = await ProjectService.deleteProject(project.id, owner.id);

      expect(success).toBe(true);

      // Project should no longer appear in user's projects
      const projects = await ProjectService.getUserProjects(owner.id);
      expect(projects.length).toBe(0);
    });

    it('returns false when non-owner tries to delete', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();

      const success = await ProjectService.deleteProject(project.id, nonMember.id);

      expect(success).toBe(false);
    });
  });

  // ============ checkProjectAccess ============

  describe('checkProjectAccess', () => {
    it('returns true for a project member', async () => {
      const { owner, ...project } = await createTestProject();

      const hasAccess = await ProjectService.checkProjectAccess(project.id, owner.id);

      expect(hasAccess).toBe(true);
    });

    it('returns false for a non-member', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();

      const hasAccess = await ProjectService.checkProjectAccess(
        project.id,
        nonMember.id
      );

      expect(hasAccess).toBe(false);
    });

    it('checks role-based access correctly', async () => {
      const { owner, ...project } = await createTestProject();

      // Owner has OWNER role
      const ownerAccess = await ProjectService.checkProjectAccess(
        project.id,
        owner.id,
        ['OWNER']
      );
      expect(ownerAccess).toBe(true);

      // Owner should not have VIEWER role
      const viewerAccess = await ProjectService.checkProjectAccess(
        project.id,
        owner.id,
        ['VIEWER']
      );
      expect(viewerAccess).toBe(false);
    });
  });
});
