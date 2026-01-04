/**
 * Comment Service
 *
 * Handles CRUD operations for task comments.
 */

import { prisma } from '../config/database.js';
import { ProjectService } from './project.service.js';
import type { Comment } from '@prisma/client';

/**
 * Comment with user info
 */
export type CommentWithUser = Comment & {
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

/**
 * Input for creating a comment
 */
export interface CreateCommentInput {
  projectId: string;
  taskId: string;
  userId: string;
  content: string;
}

/**
 * Input for updating a comment
 */
export interface UpdateCommentInput {
  commentId: string;
  userId: string;
  content: string;
}

export class CommentService {
  /**
   * Create a new comment on a task
   */
  static async create(input: CreateCommentInput): Promise<CommentWithUser | null> {
    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(input.projectId, input.userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: input.taskId,
        column: {
          projectId: input.projectId,
        },
      },
    });

    if (!task) {
      return null;
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        taskId: input.taskId,
        userId: input.userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return comment as CommentWithUser;
  }

  /**
   * Get all comments for a task
   */
  static async getTaskComments(
    projectId: string,
    taskId: string,
    userId: string
  ): Promise<CommentWithUser[] | null> {
    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          projectId,
        },
      },
    });

    if (!task) {
      return null;
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments as CommentWithUser[];
  }

  /**
   * Get a single comment by ID
   */
  static async getById(commentId: string): Promise<CommentWithUser | null> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return comment as CommentWithUser | null;
  }

  /**
   * Update a comment
   */
  static async update(input: UpdateCommentInput): Promise<CommentWithUser | null> {
    // Get comment to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: input.commentId },
    });

    if (!comment) {
      return null;
    }

    // Only the author can update their comment
    if (comment.userId !== input.userId) {
      return null;
    }

    const updated = await prisma.comment.update({
      where: { id: input.commentId },
      data: { content: input.content },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return updated as CommentWithUser;
  }

  /**
   * Delete a comment
   */
  static async delete(
    commentId: string,
    userId: string
  ): Promise<{ success: boolean; taskId?: string; projectId?: string }> {
    // Get comment with task info
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          select: {
            id: true,
            column: {
              select: { projectId: true },
            },
          },
        },
      },
    });

    if (!comment) {
      return { success: false };
    }

    // Check if user is comment author OR project admin/owner
    const projectId = comment.task.column.projectId;

    if (comment.userId !== userId) {
      // Check if user has admin/owner access
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: 'ADMIN',
                },
              },
            },
          ],
        },
      });

      if (!project) {
        return { success: false };
      }
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return {
      success: true,
      taskId: comment.task.id,
      projectId,
    };
  }

  /**
   * Get comment count for a task
   */
  static async getTaskCommentCount(taskId: string): Promise<number> {
    return prisma.comment.count({
      where: { taskId },
    });
  }
}

export default CommentService;
