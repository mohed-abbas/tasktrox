import { prisma } from '../config/database.js';
import type { Label, TaskLabel } from '@prisma/client';
import type { CreateLabelInput, UpdateLabelInput } from '../validators/label.validator.js';
import { ProjectService } from './project.service.js';

type LabelWithTaskCount = Label & {
  _count?: { tasks: number };
};

export class LabelService {
  // ============ LABEL CRUD ============

  /**
   * Get all labels for a project
   */
  static async getProjectLabels(
    projectId: string,
    userId: string
  ): Promise<LabelWithTaskCount[] | null> {
    // Check if user has access to project
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return prisma.label.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single label by ID
   */
  static async getLabelById(
    projectId: string,
    labelId: string,
    userId: string
  ): Promise<LabelWithTaskCount | null> {
    // Check if user has access to project
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return prisma.label.findFirst({
      where: {
        id: labelId,
        projectId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  /**
   * Create a new label
   */
  static async createLabel(
    projectId: string,
    userId: string,
    data: CreateLabelInput
  ): Promise<Label | null> {
    // Check if user has access (members can create labels)
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Check for duplicate name
    const existingLabel = await prisma.label.findFirst({
      where: {
        projectId,
        name: data.name,
      },
    });

    if (existingLabel) {
      throw new Error('A label with this name already exists in the project');
    }

    return prisma.label.create({
      data: {
        name: data.name,
        color: data.color,
        projectId,
      },
    });
  }

  /**
   * Update a label
   */
  static async updateLabel(
    projectId: string,
    labelId: string,
    userId: string,
    data: UpdateLabelInput
  ): Promise<Label | null> {
    // Check if user has access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Check if label exists
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        projectId,
      },
    });

    if (!label) {
      return null;
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== label.name) {
      const existingLabel = await prisma.label.findFirst({
        where: {
          projectId,
          name: data.name,
          id: { not: labelId },
        },
      });

      if (existingLabel) {
        throw new Error('A label with this name already exists in the project');
      }
    }

    return prisma.label.update({
      where: { id: labelId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });
  }

  /**
   * Delete a label
   */
  static async deleteLabel(
    projectId: string,
    labelId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Check if user has access (owner or admin only)
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId, [
      'OWNER',
      'ADMIN',
    ]);
    if (!hasAccess) {
      return { success: false, error: 'Permission denied' };
    }

    // Check if label exists
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        projectId,
      },
    });

    if (!label) {
      return { success: false, error: 'Label not found' };
    }

    // Delete label (cascade will remove TaskLabel entries)
    await prisma.label.delete({
      where: { id: labelId },
    });

    return { success: true };
  }

  // ============ TASK LABEL OPERATIONS ============

  /**
   * Add a label to a task
   */
  static async addLabelToTask(
    projectId: string,
    taskId: string,
    labelId: string,
    userId: string
  ): Promise<TaskLabel | null> {
    // Check if user has access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        column: {
          projectId,
        },
      },
    });

    if (!task) {
      throw new Error('Task not found in this project');
    }

    // Verify label belongs to project
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        projectId,
      },
    });

    if (!label) {
      throw new Error('Label not found in this project');
    }

    // Check if already assigned
    const existingTaskLabel = await prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    if (existingTaskLabel) {
      return existingTaskLabel;
    }

    return prisma.taskLabel.create({
      data: {
        taskId,
        labelId,
      },
    });
  }

  /**
   * Remove a label from a task
   */
  static async removeLabelFromTask(
    projectId: string,
    taskId: string,
    labelId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Check if user has access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return { success: false, error: 'Permission denied' };
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        column: {
          projectId,
        },
      },
    });

    if (!task) {
      return { success: false, error: 'Task not found in this project' };
    }

    // Check if label is assigned
    const taskLabel = await prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    if (!taskLabel) {
      return { success: false, error: 'Label is not assigned to this task' };
    }

    await prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Set all labels for a task (replaces existing)
   */
  static async setTaskLabels(
    projectId: string,
    taskId: string,
    labelIds: string[],
    userId: string
  ): Promise<Label[] | null> {
    // Check if user has access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        column: {
          projectId,
        },
      },
    });

    if (!task) {
      throw new Error('Task not found in this project');
    }

    // Verify all labels belong to project
    if (labelIds.length > 0) {
      const labels = await prisma.label.findMany({
        where: {
          id: { in: labelIds },
          projectId,
        },
      });

      if (labels.length !== labelIds.length) {
        throw new Error('One or more labels do not exist in this project');
      }
    }

    // Transaction: delete all existing and create new
    await prisma.$transaction([
      prisma.taskLabel.deleteMany({
        where: { taskId },
      }),
      ...(labelIds.length > 0
        ? [
            prisma.taskLabel.createMany({
              data: labelIds.map((labelId) => ({
                taskId,
                labelId,
              })),
            }),
          ]
        : []),
    ]);

    // Return updated labels
    return prisma.label.findMany({
      where: {
        id: { in: labelIds },
      },
    });
  }

  /**
   * Get all labels for a task
   */
  static async getTaskLabels(
    projectId: string,
    taskId: string,
    userId: string
  ): Promise<Label[] | null> {
    // Check if user has access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        column: {
          projectId,
        },
      },
      include: {
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return task.labels.map((tl) => tl.label);
  }
}

export default LabelService;
