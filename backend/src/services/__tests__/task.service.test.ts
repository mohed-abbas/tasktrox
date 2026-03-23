import { TaskService } from '../task.service.js';
import {
  createTestUser,
  createTestProject,
  createTestTask,
} from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';
import { prisma } from '../../config/database.js';

describe('TaskService', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ createTask ============

  describe('createTask', () => {
    it('creates a task in a column with correct fields', async () => {
      const { owner, columns } = await createTestProject();
      const columnId = columns[0]!.id;

      const task = await TaskService.createTask(columnId, owner.id, {
        title: 'My First Task',
        description: 'A description',
        priority: 'HIGH',
      });

      expect(task).not.toBeNull();
      expect(task!.title).toBe('My First Task');
      expect(task!.priority).toBe('HIGH');
      expect(task!.columnId).toBe(columnId);
      expect(task!.createdById).toBe(owner.id);
      expect(task!.order).toBe(0); // first task
    });

    it('assigns sequential order to tasks in the same column', async () => {
      const { owner, columns } = await createTestProject();
      const columnId = columns[0]!.id;

      const task1 = await TaskService.createTask(columnId, owner.id, {
        title: 'Task 1',
      });
      const task2 = await TaskService.createTask(columnId, owner.id, {
        title: 'Task 2',
      });

      expect(task1!.order).toBe(0);
      expect(task2!.order).toBe(1);
    });

    it('returns null for a non-member trying to create a task', async () => {
      const { columns } = await createTestProject();
      const nonMember = await createTestUser();
      const columnId = columns[0]!.id;

      const task = await TaskService.createTask(columnId, nonMember.id, {
        title: 'Unauthorized Task',
      });

      expect(task).toBeNull();
    });
  });

  // ============ getTaskById ============

  describe('getTaskById', () => {
    it('returns the task for a project member', async () => {
      const { owner, columns } = await createTestProject();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        title: 'Findable Task',
      });

      const task = await TaskService.getTaskById(created.id, owner.id);

      expect(task).not.toBeNull();
      expect(task!.id).toBe(created.id);
      expect(task!.title).toBe('Findable Task');
    });

    it('returns null for a non-member', async () => {
      const { owner, columns } = await createTestProject();
      const nonMember = await createTestUser();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const task = await TaskService.getTaskById(created.id, nonMember.id);

      expect(task).toBeNull();
    });

    it('returns null for a soft-deleted task', async () => {
      const { owner, columns } = await createTestProject();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      // Soft-delete the task
      await prisma.task.update({
        where: { id: created.id },
        data: { deletedAt: new Date() },
      });

      const task = await TaskService.getTaskById(created.id, owner.id);
      expect(task).toBeNull();
    });
  });

  // ============ updateTask ============

  describe('updateTask', () => {
    it('updates title, description, and priority', async () => {
      const { owner, columns } = await createTestProject();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        title: 'Original Title',
      });

      const updated = await TaskService.updateTask(created.id, owner.id, {
        title: 'Updated Title',
        description: 'New description',
        priority: 'LOW',
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.priority).toBe('LOW');
    });

    it('returns null for a non-member trying to update', async () => {
      const { owner, columns } = await createTestProject();
      const nonMember = await createTestUser();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const result = await TaskService.updateTask(created.id, nonMember.id, {
        title: 'Hacked Title',
      });

      expect(result).toBeNull();
    });

    it('marks a task as completed', async () => {
      const { owner, columns } = await createTestProject();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const updated = await TaskService.updateTask(created.id, owner.id, {
        completed: true,
      });

      expect(updated).not.toBeNull();
      expect(updated!.completedAt).not.toBeNull();
    });
  });

  // ============ deleteTask ============

  describe('deleteTask', () => {
    it('soft-deletes a task (sets deletedAt)', async () => {
      const { owner, columns } = await createTestProject();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const result = await TaskService.deleteTask(created.id, owner.id);

      expect(result.success).toBe(true);

      // Verify task is soft-deleted
      const dbTask = await prisma.task.findUnique({
        where: { id: created.id },
      });
      expect(dbTask!.deletedAt).not.toBeNull();
    });

    it('returns failure for a non-member trying to delete', async () => {
      const { owner, columns } = await createTestProject();
      const nonMember = await createTestUser();
      const created = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
      });

      const result = await TaskService.deleteTask(created.id, nonMember.id);

      expect(result.success).toBe(false);
    });

    it('returns failure for a non-existent task', async () => {
      const user = await createTestUser();
      const result = await TaskService.deleteTask('non-existent-id', user.id);
      expect(result.success).toBe(false);
    });
  });

  // ============ moveTask ============

  describe('moveTask', () => {
    it('moves a task to a different column', async () => {
      const { owner, columns } = await createTestProject();
      const sourceColumn = columns[0]!; // To Do
      const targetColumn = columns[1]!; // In Progress

      const task = await createTestTask({
        columnId: sourceColumn.id,
        createdById: owner.id,
        title: 'Move Me',
        order: 0,
      });

      const moved = await TaskService.moveTask(task.id, owner.id, {
        targetColumnId: targetColumn.id,
        order: 0,
      });

      expect(moved).not.toBeNull();
      expect(moved!.columnId).toBe(targetColumn.id);
      expect(moved!.order).toBe(0);
    });

    it('returns null for a non-member trying to move', async () => {
      const { owner, columns } = await createTestProject();
      const nonMember = await createTestUser();

      const task = await createTestTask({
        columnId: columns[0]!.id,
        createdById: owner.id,
        order: 0,
      });

      const result = await TaskService.moveTask(task.id, nonMember.id, {
        targetColumnId: columns[1]!.id,
        order: 0,
      });

      expect(result).toBeNull();
    });

    it('returns null when target column is in a different project', async () => {
      const project1 = await createTestProject();
      const project2 = await createTestProject();

      const task = await createTestTask({
        columnId: project1.columns[0]!.id,
        createdById: project1.owner.id,
        order: 0,
      });

      const result = await TaskService.moveTask(task.id, project1.owner.id, {
        targetColumnId: project2.columns[0]!.id,
        order: 0,
      });

      expect(result).toBeNull();
    });

    it('updates order correctly when moving within the same column', async () => {
      const { owner, columns } = await createTestProject();
      const columnId = columns[0]!.id;

      const task0 = await createTestTask({
        columnId,
        createdById: owner.id,
        title: 'Task 0',
        order: 0,
      });
      await createTestTask({
        columnId,
        createdById: owner.id,
        title: 'Task 1',
        order: 1,
      });

      // Move task 0 to position 1 (same column reorder)
      const moved = await TaskService.moveTask(task0.id, owner.id, {
        targetColumnId: columnId,
        order: 1,
      });

      expect(moved).not.toBeNull();
      expect(moved!.order).toBe(1);
    });
  });
});
