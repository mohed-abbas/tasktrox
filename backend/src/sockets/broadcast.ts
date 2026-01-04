/**
 * Broadcast Utility for Live Updates
 *
 * Provides typed helper functions to broadcast Socket.io events
 * from REST API handlers to project rooms.
 */

import { socketLogger } from '../config/logger.js';
import { getIO } from './index.js';
import type {
  LiveTask,
  LiveColumn,
  LiveActivity,
  LiveAttachment,
  LiveComment,
  LiveUpdateMeta,
  TaskMovedPayload,
  TaskReorderedPayload,
  ColumnReorderedPayload,
} from '../types/presence.js';

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Create metadata for live update events.
 */
function createMeta(userId: string): LiveUpdateMeta {
  return {
    userId,
    timestamp: Date.now(),
  };
}

/**
 * Get the project room name.
 */
function getProjectRoom(projectId: string): string {
  return `project:${projectId}`;
}

// -----------------------------------------------------------------------------
// Task Broadcast Functions
// -----------------------------------------------------------------------------

/**
 * Broadcast when a task is created.
 */
export function broadcastTaskCreated(
  projectId: string,
  task: LiveTask,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('task:created', {
      task,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, taskId: task.id, userId },
      'Broadcast task:created'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, taskId: task.id },
      'Failed to broadcast task:created'
    );
  }
}

/**
 * Broadcast when a task is updated.
 */
export function broadcastTaskUpdated(
  projectId: string,
  task: LiveTask,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('task:updated', {
      task,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, taskId: task.id, userId },
      'Broadcast task:updated'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, taskId: task.id },
      'Failed to broadcast task:updated'
    );
  }
}

/**
 * Broadcast when a task is deleted.
 */
export function broadcastTaskDeleted(
  projectId: string,
  taskId: string,
  columnId: string,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('task:deleted', {
      taskId,
      columnId,
      projectId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, taskId, columnId, userId },
      'Broadcast task:deleted'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, taskId },
      'Failed to broadcast task:deleted'
    );
  }
}

/**
 * Broadcast when a task is moved to a different column.
 */
export function broadcastTaskMoved(
  payload: Omit<TaskMovedPayload, 'userId'>,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(payload.projectId)).emit('task:moved', {
      ...payload,
      userId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { ...payload, userId },
      'Broadcast task:moved'
    );
  } catch (error) {
    socketLogger.error(
      { error, ...payload },
      'Failed to broadcast task:moved'
    );
  }
}

/**
 * Broadcast when a task is reordered within its column.
 */
export function broadcastTaskReordered(
  payload: Omit<TaskReorderedPayload, 'userId'>,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(payload.projectId)).emit('task:reordered', {
      ...payload,
      userId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { ...payload, userId },
      'Broadcast task:reordered'
    );
  } catch (error) {
    socketLogger.error(
      { error, ...payload },
      'Failed to broadcast task:reordered'
    );
  }
}

// -----------------------------------------------------------------------------
// Column Broadcast Functions
// -----------------------------------------------------------------------------

/**
 * Broadcast when a column is created.
 */
export function broadcastColumnCreated(
  projectId: string,
  column: LiveColumn,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('column:created', {
      column,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, columnId: column.id, userId },
      'Broadcast column:created'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, columnId: column.id },
      'Failed to broadcast column:created'
    );
  }
}

/**
 * Broadcast when a column is updated.
 */
export function broadcastColumnUpdated(
  projectId: string,
  column: LiveColumn,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('column:updated', {
      column,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, columnId: column.id, userId },
      'Broadcast column:updated'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, columnId: column.id },
      'Failed to broadcast column:updated'
    );
  }
}

/**
 * Broadcast when a column is deleted.
 */
export function broadcastColumnDeleted(
  projectId: string,
  columnId: string,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('column:deleted', {
      columnId,
      projectId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, columnId, userId },
      'Broadcast column:deleted'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, columnId },
      'Failed to broadcast column:deleted'
    );
  }
}

/**
 * Broadcast when a column is reordered.
 */
export function broadcastColumnReordered(
  payload: Omit<ColumnReorderedPayload, 'userId'>,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(payload.projectId)).emit('column:reordered', {
      ...payload,
      userId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { ...payload, userId },
      'Broadcast column:reordered'
    );
  } catch (error) {
    socketLogger.error(
      { error, ...payload },
      'Failed to broadcast column:reordered'
    );
  }
}

// -----------------------------------------------------------------------------
// Activity Broadcast Functions
// -----------------------------------------------------------------------------

/**
 * Broadcast when an activity is logged.
 */
export function broadcastActivityLogged(
  projectId: string,
  activity: LiveActivity,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('activity:logged', {
      activity,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, activityId: activity.id, userId },
      'Broadcast activity:logged'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, activityId: activity.id },
      'Failed to broadcast activity:logged'
    );
  }
}

// -----------------------------------------------------------------------------
// Attachment Broadcast Functions
// -----------------------------------------------------------------------------

/**
 * Broadcast when an attachment is uploaded.
 */
export function broadcastAttachmentUploaded(
  projectId: string,
  attachment: LiveAttachment,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('attachment:uploaded', {
      attachment,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, attachmentId: attachment.id, userId },
      'Broadcast attachment:uploaded'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, attachmentId: attachment.id },
      'Failed to broadcast attachment:uploaded'
    );
  }
}

/**
 * Broadcast when an attachment is deleted.
 */
export function broadcastAttachmentDeleted(
  projectId: string,
  attachmentId: string,
  taskId: string,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('attachment:deleted', {
      attachmentId,
      taskId,
      projectId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, attachmentId, taskId, userId },
      'Broadcast attachment:deleted'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, attachmentId },
      'Failed to broadcast attachment:deleted'
    );
  }
}

// -----------------------------------------------------------------------------
// Comment Broadcast Functions
// -----------------------------------------------------------------------------

/**
 * Broadcast when a comment is created.
 */
export function broadcastCommentCreated(
  projectId: string,
  comment: LiveComment,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('comment:created', {
      comment,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, commentId: comment.id, userId },
      'Broadcast comment:created'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, commentId: comment.id },
      'Failed to broadcast comment:created'
    );
  }
}

/**
 * Broadcast when a comment is updated.
 */
export function broadcastCommentUpdated(
  projectId: string,
  comment: LiveComment,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('comment:updated', {
      comment,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, commentId: comment.id, userId },
      'Broadcast comment:updated'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, commentId: comment.id },
      'Failed to broadcast comment:updated'
    );
  }
}

/**
 * Broadcast when a comment is deleted.
 */
export function broadcastCommentDeleted(
  projectId: string,
  commentId: string,
  taskId: string,
  userId: string
): void {
  try {
    const io = getIO();
    io.to(getProjectRoom(projectId)).emit('comment:deleted', {
      commentId,
      taskId,
      projectId,
      meta: createMeta(userId),
    });
    socketLogger.debug(
      { projectId, commentId, taskId, userId },
      'Broadcast comment:deleted'
    );
  } catch (error) {
    socketLogger.error(
      { error, projectId, commentId },
      'Failed to broadcast comment:deleted'
    );
  }
}
