import { prisma } from '../config/database.js';
import { ProjectService } from './project.service.js';

export interface Assignee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  assignedAt: Date;
}

export class AssigneeService {
  /**
   * Get all assignees for a task
   */
  static async getTaskAssignees(
    projectId: string,
    taskId: string,
    userId: string
  ): Promise<Assignee[] | null> {
    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true },
        },
      },
    });

    if (!task || task.deletedAt || task.column.projectId !== projectId) {
      return null;
    }

    const assignees = await prisma.taskAssignee.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    return assignees.map((a) => ({
      id: a.user.id,
      name: a.user.name,
      email: a.user.email,
      avatar: a.user.avatar,
      assignedAt: a.assignedAt,
    }));
  }

  /**
   * Add an assignee to a task
   */
  static async addAssignee(
    projectId: string,
    taskId: string,
    requesterId: string,
    targetUserId: string
  ): Promise<Assignee | null> {
    // Check requester has project access with edit permission
    const hasAccess = await ProjectService.checkProjectAccess(
      projectId,
      requesterId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true },
        },
      },
    });

    if (!task || task.deletedAt || task.column.projectId !== projectId) {
      return null;
    }

    // Verify target user is a member of the project
    const isMember = await ProjectService.checkProjectAccess(projectId, targetUserId);
    if (!isMember) {
      throw new Error('User must be a project member to be assigned');
    }

    // Check if already assigned
    const existing = await prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: targetUserId,
        },
      },
    });

    if (existing) {
      // Return existing assignment
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, email: true, avatar: true },
      });
      return user
        ? {
            ...user,
            assignedAt: existing.assignedAt,
          }
        : null;
    }

    // Create assignment
    const assignee = await prisma.taskAssignee.create({
      data: {
        taskId,
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: assignee.user.id,
      name: assignee.user.name,
      email: assignee.user.email,
      avatar: assignee.user.avatar,
      assignedAt: assignee.assignedAt,
    };
  }

  /**
   * Remove an assignee from a task
   */
  static async removeAssignee(
    projectId: string,
    taskId: string,
    requesterId: string,
    targetUserId: string
  ): Promise<boolean> {
    // Check requester has project access with edit permission
    const hasAccess = await ProjectService.checkProjectAccess(
      projectId,
      requesterId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return false;
    }

    // Verify task belongs to project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true },
        },
      },
    });

    if (!task || task.deletedAt || task.column.projectId !== projectId) {
      return false;
    }

    // Check if assignment exists
    const existing = await prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: targetUserId,
        },
      },
    });

    if (!existing) {
      return false;
    }

    // Remove assignment
    await prisma.taskAssignee.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: targetUserId,
        },
      },
    });

    return true;
  }

  /**
   * Set assignees for a task (replace all)
   */
  static async setAssignees(
    projectId: string,
    taskId: string,
    requesterId: string,
    userIds: string[]
  ): Promise<Assignee[] | null> {
    // Check requester has project access with edit permission
    const hasAccess = await ProjectService.checkProjectAccess(
      projectId,
      requesterId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true },
        },
      },
    });

    if (!task || task.deletedAt || task.column.projectId !== projectId) {
      return null;
    }

    // Verify all target users are project members
    const validUserIds: string[] = [];
    for (const userId of userIds) {
      const isMember = await ProjectService.checkProjectAccess(projectId, userId);
      if (isMember) {
        validUserIds.push(userId);
      }
    }

    // Use transaction to replace all assignments
    await prisma.$transaction(async (tx) => {
      // Delete existing assignments
      await tx.taskAssignee.deleteMany({
        where: { taskId },
      });

      // Create new assignments
      if (validUserIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: validUserIds.map((userId) => ({
            taskId,
            userId,
          })),
        });
      }
    });

    // Return new assignees list
    const assignees = await prisma.taskAssignee.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    return assignees.map((a) => ({
      id: a.user.id,
      name: a.user.name,
      email: a.user.email,
      avatar: a.user.avatar,
      assignedAt: a.assignedAt,
    }));
  }

  /**
   * Get all project members available for assignment
   */
  static async getAvailableAssignees(
    projectId: string,
    userId: string
  ): Promise<{ id: string; name: string; email: string; avatar: string | null }[] | null> {
    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    return members.map((m) => m.user);
  }
}

export default AssigneeService;
