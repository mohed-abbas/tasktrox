import { ColumnService } from '../column.service.js';
import {
  createTestUser,
  createTestProject,
  createTestColumn,
} from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';

describe('ColumnService', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ getProjectColumns ============

  describe('getProjectColumns', () => {
    it('returns columns for a project member, ordered by order field', async () => {
      const { owner, ...project } = await createTestProject();

      const columns = await ColumnService.getProjectColumns(project.id, owner.id);

      expect(columns).not.toBeNull();
      expect(columns!.length).toBe(3); // Factory creates To Do, In Progress, Done
      expect(columns![0]!.name).toBe('To Do');
      expect(columns![1]!.name).toBe('In Progress');
      expect(columns![2]!.name).toBe('Done');

      // Verify ordered by order
      for (let i = 1; i < columns!.length; i++) {
        expect(columns![i]!.order).toBeGreaterThan(columns![i - 1]!.order);
      }
    });

    it('returns null for a non-member', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();

      const columns = await ColumnService.getProjectColumns(
        project.id,
        nonMember.id
      );

      expect(columns).toBeNull();
    });
  });

  // ============ createColumn ============

  describe('createColumn', () => {
    it('creates a column with correct order (appended at end)', async () => {
      const { owner, columns, ...project } = await createTestProject();
      const existingCount = columns.length; // 3 from factory

      const newColumn = await ColumnService.createColumn(project.id, owner.id, {
        name: 'New Column',
      });

      expect(newColumn).not.toBeNull();
      expect(newColumn!.name).toBe('New Column');
      expect(newColumn!.order).toBe(existingCount); // appended at end
      expect(newColumn!.projectId).toBe(project.id);
    });

    it('creates a column with a specific order and shifts existing columns', async () => {
      const { owner, ...project } = await createTestProject();

      // Insert at position 1 (between To Do and In Progress)
      const inserted = await ColumnService.createColumn(project.id, owner.id, {
        name: 'Inserted Column',
        order: 1,
      });

      expect(inserted).not.toBeNull();
      expect(inserted!.order).toBe(1);

      // Verify all columns are still correctly ordered
      const allColumns = await ColumnService.getProjectColumns(
        project.id,
        owner.id
      );
      expect(allColumns).not.toBeNull();
      expect(allColumns![1]!.name).toBe('Inserted Column');
    });

    it('returns null for a non-member', async () => {
      const project = await createTestProject();
      const nonMember = await createTestUser();

      const column = await ColumnService.createColumn(project.id, nonMember.id, {
        name: 'Unauthorized Column',
      });

      expect(column).toBeNull();
    });
  });

  // ============ updateColumn ============

  describe('updateColumn', () => {
    it('updates column name', async () => {
      const { owner, columns } = await createTestProject();
      const columnId = columns[0]!.id;

      const updated = await ColumnService.updateColumn(columnId, owner.id, {
        name: 'Updated Name',
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated Name');
    });

    it('returns null for a non-member', async () => {
      const { columns } = await createTestProject();
      const nonMember = await createTestUser();

      const result = await ColumnService.updateColumn(columns[0]!.id, nonMember.id, {
        name: 'Hacked Name',
      });

      expect(result).toBeNull();
    });
  });

  // ============ deleteColumn ============

  describe('deleteColumn', () => {
    it('deletes an empty column for the owner', async () => {
      const { owner, ...project } = await createTestProject();

      // Create an extra column with no tasks
      const extra = await createTestColumn({
        projectId: project.id,
        name: 'Empty Column',
        order: 10,
      });

      const result = await ColumnService.deleteColumn(extra.id, owner.id);

      expect(result.success).toBe(true);

      // Verify column is gone
      const columns = await ColumnService.getProjectColumns(project.id, owner.id);
      const names = columns!.map((c) => c.name);
      expect(names).not.toContain('Empty Column');
    });

    it('returns error for a non-member', async () => {
      const { columns } = await createTestProject();
      const nonMember = await createTestUser();

      const result = await ColumnService.deleteColumn(columns[0]!.id, nonMember.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('returns error when deleting a column with tasks and no target', async () => {
      const { owner, columns } = await createTestProject();
      const columnId = columns[0]!.id;

      // Add a task to the column via direct DB insert
      const { prisma } = await import('../../config/database.js');
      await prisma.task.create({
        data: {
          title: 'Blocking Task',
          order: 0,
          columnId,
          createdById: owner.id,
        },
      });

      const result = await ColumnService.deleteColumn(columnId, owner.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Column has tasks');
    });
  });

  // ============ getColumnById ============

  describe('getColumnById', () => {
    it('returns a column for a project member', async () => {
      const { owner, columns } = await createTestProject();

      const column = await ColumnService.getColumnById(columns[0]!.id, owner.id);

      expect(column).not.toBeNull();
      expect(column!.id).toBe(columns[0]!.id);
    });

    it('returns null for a non-member', async () => {
      const { columns } = await createTestProject();
      const nonMember = await createTestUser();

      const column = await ColumnService.getColumnById(columns[0]!.id, nonMember.id);

      expect(column).toBeNull();
    });
  });
});
