import { prisma } from '../config/database.js';
import type { Activity, Prisma } from '@prisma/client';
import { ProjectService } from './project.service.js';

/**
 * Activity action types for logging
 */
export const ActivityAction = {
  // Task actions
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_MOVED: 'task.moved',
  TASK_REORDERED: 'task.reordered',
  TASK_COMPLETED: 'task.completed',
  TASK_REOPENED: 'task.reopened',

  // Column actions
  COLUMN_CREATED: 'column.created',
  COLUMN_UPDATED: 'column.updated',
  COLUMN_DELETED: 'column.deleted',
  COLUMN_REORDERED: 'column.reordered',

  // Label actions
  LABEL_CREATED: 'label.created',
  LABEL_UPDATED: 'label.updated',
  LABEL_DELETED: 'label.deleted',
  LABEL_ADDED: 'label.added',
  LABEL_REMOVED: 'label.removed',

  // Assignee actions
  ASSIGNEE_ADDED: 'assignee.added',
  ASSIGNEE_REMOVED: 'assignee.removed',

  // Comment actions
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',

  // Attachment actions
  ATTACHMENT_UPLOADED: 'attachment.uploaded',
  ATTACHMENT_DELETED: 'attachment.deleted',

  // Member actions
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',

  // Project actions
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
} as const;

export type ActivityActionType = (typeof ActivityAction)[keyof typeof ActivityAction];

/**
 * Metadata structure for different activity types
 */
export interface ActivityMetadata {
  // Task metadata
  taskTitle?: string;
  taskId?: string;

  // Column metadata
  columnName?: string;
  columnId?: string;
  fromColumn?: string;
  toColumn?: string;
  fromOrder?: number;
  toOrder?: number;

  // Label metadata
  labelName?: string;
  labelColor?: string;
  labelId?: string;

  // Assignee metadata
  assigneeName?: string;
  assigneeId?: string;

  // Comment metadata
  commentId?: string;
  commentPreview?: string;

  // Attachment metadata
  attachmentName?: string;
  attachmentId?: string;

  // Member metadata
  memberName?: string;
  memberId?: string;
  previousRole?: string;
  newRole?: string;

  // Project metadata
  projectName?: string;

  // Generic update metadata
  changes?: Record<string, { from?: unknown; to: unknown }>;
}

/**
 * Input for logging an activity
 */
export interface LogActivityInput {
  action: ActivityActionType;
  projectId: string;
  userId: string;
  taskId?: string;
  metadata?: ActivityMetadata;
}

/**
 * Activity with user relation
 */
export type ActivityWithUser = Activity & {
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  task?: {
    id: string;
    title: string;
  } | null;
};

/**
 * Pagination options for fetching activities
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

/**
 * Actions that should be deduplicated when occurring rapidly
 * (e.g., multiple task.updated from typing with pauses)
 */
const DEDUPE_ACTIONS: Set<ActivityActionType> = new Set([
  ActivityAction.TASK_UPDATED,
  ActivityAction.TASK_REORDERED,
]);

/**
 * Time window for deduplication (in milliseconds)
 * Activities within this window are coalesced into one
 */
const DEDUPE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export class ActivityService {
  /**
   * Log an activity with automatic deduplication for rapid updates.
   * For certain actions (like task.updated), if a similar activity exists
   * within the deduplication window, it will be updated instead of creating a new one.
   */
  static async log(input: LogActivityInput): Promise<Activity> {
    // Check if this action type should be deduplicated
    if (DEDUPE_ACTIONS.has(input.action) && input.taskId) {
      const dedupeThreshold = new Date(Date.now() - DEDUPE_WINDOW_MS);

      // Look for a recent similar activity
      const existingActivity = await prisma.activity.findFirst({
        where: {
          action: input.action,
          projectId: input.projectId,
          userId: input.userId,
          taskId: input.taskId,
          createdAt: { gte: dedupeThreshold },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingActivity) {
        // Update the existing activity with new metadata and refresh timestamp
        const mergedMetadata = {
          ...(existingActivity.metadata as Prisma.JsonObject ?? {}),
          ...(input.metadata as Prisma.JsonObject ?? {}),
        };

        const updatedActivity = await prisma.activity.update({
          where: { id: existingActivity.id },
          data: {
            metadata: mergedMetadata,
            createdAt: new Date(), // Refresh timestamp to show latest update time
          },
        });

        return updatedActivity;
      }
    }

    // Create new activity (either not deduplicatable or no recent similar activity)
    const activity = await prisma.activity.create({
      data: {
        action: input.action,
        projectId: input.projectId,
        userId: input.userId,
        taskId: input.taskId ?? null,
        metadata: input.metadata as Prisma.JsonObject ?? null,
      },
    });

    return activity;
  }

  /**
   * Log an activity without awaiting (fire and forget)
   * Use this when you don't need to wait for the activity to be logged
   */
  static logAsync(input: LogActivityInput): void {
    this.log(input).catch(() => {
      // Silently handle activity logging errors
      // Activity logging should never break the main flow
    });
  }

  /**
   * Get activities for a project with pagination
   */
  static async getProjectActivities(
    projectId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<ActivityWithUser[] | null> {
    // Check user has access to the project
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const { limit = 20, offset = 0 } = options;

    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return activities as ActivityWithUser[];
  }

  /**
   * Get activities for a specific task
   */
  static async getTaskActivities(
    taskId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<ActivityWithUser[] | null> {
    // Get task and check access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        column: {
          select: { projectId: true },
        },
      },
    });

    if (!task) {
      return null;
    }

    const hasAccess = await ProjectService.checkProjectAccess(
      task.column.projectId,
      userId
    );
    if (!hasAccess) {
      return null;
    }

    const { limit = 20, offset = 0 } = options;

    const activities = await prisma.activity.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return activities as ActivityWithUser[];
  }

  /**
   * Get activity count for a project
   */
  static async getProjectActivityCount(
    projectId: string,
    userId: string
  ): Promise<number | null> {
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return prisma.activity.count({
      where: { projectId },
    });
  }

  /**
   * Get recent activities for a user across all their projects
   */
  static async getUserRecentActivities(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<ActivityWithUser[]> {
    const { limit = 20, offset = 0 } = options;

    // Get user's project memberships
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    // Also include projects owned by user
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId, deletedAt: null },
      select: { id: true },
    });

    const projectIds = [
      ...new Set([
        ...memberships.map((m) => m.projectId),
        ...ownedProjects.map((p) => p.id),
      ]),
    ];

    if (projectIds.length === 0) {
      return [];
    }

    const activities = await prisma.activity.findMany({
      where: {
        projectId: { in: projectIds },
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return activities as ActivityWithUser[];
  }
}

export default ActivityService;
