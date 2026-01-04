/**
 * Presence Types for Real-time Collaboration
 *
 * Type definitions for the Socket.io-based presence system
 * that enables real-time editing indicators and user presence.
 */

// -----------------------------------------------------------------------------
// Field Types
// -----------------------------------------------------------------------------

/**
 * Editable fields that can have presence indicators.
 * - 'title': Task title field
 * - 'description': Task description field
 * - 'column-name': Column header name field
 */
export type EditingField = 'title' | 'description' | 'column-name';

// -----------------------------------------------------------------------------
// Redis Storage Types
// -----------------------------------------------------------------------------

/**
 * Presence entry stored in Redis for tracking active editors.
 * Key pattern: `presence:{projectId}:{taskId}:{field}`
 */
export interface PresenceEntry {
  /** The task being edited */
  taskId: string;
  /** The field within the task being edited */
  field: EditingField;
  /** ID of the user editing */
  userId: string;
  /** Display name of the user */
  userName: string;
  /** Avatar URL or null if not set */
  userAvatar: string | null;
  /** Project this task belongs to */
  projectId: string;
  /** Socket connection ID for cleanup on disconnect */
  socketId: string;
  /** Unix timestamp (ms) when editing started */
  startedAt: number;
}

// -----------------------------------------------------------------------------
// Socket Event Payloads
// -----------------------------------------------------------------------------

/**
 * Payload for starting an editing session.
 * Sent from client when user focuses on an editable field.
 */
export interface EditingStartPayload {
  /** Project containing the task */
  projectId: string;
  /** Task being edited */
  taskId: string;
  /** Field being edited */
  field: EditingField;
}

/**
 * Payload for stopping an editing session.
 * Sent from client when user blurs an editable field.
 */
export interface EditingStopPayload {
  /** Project containing the task */
  projectId: string;
  /** Task that was being edited */
  taskId: string;
  /** Field that was being edited */
  field: EditingField;
}

/**
 * Payload broadcast when a user starts editing.
 * Sent to all other users in the project room.
 */
export interface EditingActivePayload {
  /** Task being edited */
  taskId: string;
  /** Field being edited */
  field: EditingField;
  /** User who is editing */
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

/**
 * Payload broadcast when a user stops editing.
 * Sent to all other users in the project room.
 */
export interface EditingInactivePayload {
  /** Task that was being edited */
  taskId: string;
  /** Field that was being edited */
  field: EditingField;
}

// -----------------------------------------------------------------------------
// Socket.io Type Definitions
// -----------------------------------------------------------------------------

/**
 * Events emitted from client to server.
 */
export interface ClientToServerEvents {
  /**
   * Join a project room to receive presence updates.
   * @param projectId - The project to join
   */
  'project:join': (projectId: string) => void;

  /**
   * Leave a project room to stop receiving presence updates.
   * @param projectId - The project to leave
   */
  'project:leave': (projectId: string) => void;

  /**
   * Notify that the user has started editing a field.
   * @param data - Editing start payload
   */
  'editing:start': (data: EditingStartPayload) => void;

  /**
   * Notify that the user has stopped editing a field.
   * @param data - Editing stop payload
   */
  'editing:stop': (data: EditingStopPayload) => void;
}

/**
 * Events emitted from server to client.
 */
export interface ServerToClientEvents {
  // -------------------------------------------------------------------------
  // Presence Events
  // -------------------------------------------------------------------------

  /**
   * Broadcast when a user starts editing a field.
   * @param data - Information about the active editor
   */
  'editing:active': (data: EditingActivePayload) => void;

  /**
   * Broadcast when a user stops editing a field.
   * @param data - Information about the stopped edit
   */
  'editing:inactive': (data: EditingInactivePayload) => void;

  /**
   * Sync all current presence entries for a project.
   * Sent when a user joins a project room.
   * @param entries - All active presence entries in the project
   */
  'presence:sync': (entries: PresenceEntry[]) => void;

  // -------------------------------------------------------------------------
  // Task Live Update Events
  // -------------------------------------------------------------------------

  /**
   * Broadcast when a new task is created.
   * @param data - The created task data with metadata
   */
  'task:created': (data: { task: LiveTask; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a task is updated.
   * @param data - The updated task data with metadata
   */
  'task:updated': (data: { task: LiveTask; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a task is deleted.
   * @param data - The deleted task ID, column ID, and metadata
   */
  'task:deleted': (data: { taskId: string; columnId: string; projectId: string; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a task is moved to a different column.
   * @param data - Task movement details with metadata
   */
  'task:moved': (data: TaskMovedPayload & { meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a task is reordered within its column.
   * @param data - Task reorder details with metadata
   */
  'task:reordered': (data: TaskReorderedPayload & { meta: LiveUpdateMeta }) => void;

  // -------------------------------------------------------------------------
  // Column Live Update Events
  // -------------------------------------------------------------------------

  /**
   * Broadcast when a new column is created.
   * @param data - The created column data with metadata
   */
  'column:created': (data: { column: LiveColumn; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a column is updated.
   * @param data - The updated column data with metadata
   */
  'column:updated': (data: { column: LiveColumn; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a column is deleted.
   * @param data - The deleted column ID and metadata
   */
  'column:deleted': (data: { columnId: string; projectId: string; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a column is reordered.
   * @param data - Column reorder details with metadata
   */
  'column:reordered': (data: ColumnReorderedPayload & { meta: LiveUpdateMeta }) => void;

  // -------------------------------------------------------------------------
  // Activity Live Update Events
  // -------------------------------------------------------------------------

  /**
   * Broadcast when a new activity is logged.
   * @param data - The activity data with metadata
   */
  'activity:logged': (data: { activity: LiveActivity; meta: LiveUpdateMeta }) => void;

  // -------------------------------------------------------------------------
  // Attachment Live Update Events
  // -------------------------------------------------------------------------

  /**
   * Broadcast when a new attachment is uploaded.
   * @param data - The attachment data with metadata
   */
  'attachment:uploaded': (data: { attachment: LiveAttachment; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when an attachment is deleted.
   * @param data - The deleted attachment ID and metadata
   */
  'attachment:deleted': (data: { attachmentId: string; taskId: string; projectId: string; meta: LiveUpdateMeta }) => void;

  // -------------------------------------------------------------------------
  // Comment Live Update Events
  // -------------------------------------------------------------------------

  /**
   * Broadcast when a new comment is created.
   * @param data - The comment data with metadata
   */
  'comment:created': (data: { comment: LiveComment; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a comment is updated.
   * @param data - The updated comment data with metadata
   */
  'comment:updated': (data: { comment: LiveComment; meta: LiveUpdateMeta }) => void;

  /**
   * Broadcast when a comment is deleted.
   * @param data - The deleted comment ID and metadata
   */
  'comment:deleted': (data: { commentId: string; taskId: string; projectId: string; meta: LiveUpdateMeta }) => void;
}

/**
 * Events for server-to-server communication.
 * Reserved for future horizontal scaling with multiple Socket.io servers.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InterServerEvents {
  // Empty for now - will be used for multi-server presence sync
}

// -----------------------------------------------------------------------------
// Live Update Types
// -----------------------------------------------------------------------------

/**
 * Task data broadcast for live updates.
 * Matches the shape returned by TaskService methods.
 */
export interface LiveTask {
  id: string;
  title: string;
  description: string | null;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  dueDate: string | null;
  columnId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  labels?: Array<{
    labelId: string;
    label: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  assignees?: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
  column?: {
    id: string;
    name: string;
    projectId: string;
  };
}

/**
 * Column data broadcast for live updates.
 * Matches the shape returned by ColumnService methods.
 */
export interface LiveColumn {
  id: string;
  name: string;
  order: number;
  color: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity data broadcast for live updates.
 * Matches the shape returned by ActivityService methods.
 */
export interface LiveActivity {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  projectId: string;
  taskId: string | null;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  task?: {
    id: string;
    title: string;
  } | null;
}

/**
 * Attachment data broadcast for live updates.
 * Matches the shape returned by AttachmentService methods.
 */
export interface LiveAttachment {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  taskId: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

/**
 * Comment data broadcast for live updates.
 * Matches the shape returned by CommentService methods.
 */
export interface LiveComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

/**
 * Payload for task moved event.
 */
export interface TaskMovedPayload {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  order: number;
  projectId: string;
  /** User who made the change */
  userId: string;
}

/**
 * Payload for task reordered event.
 */
export interface TaskReorderedPayload {
  taskId: string;
  columnId: string;
  order: number;
  projectId: string;
  userId: string;
}

/**
 * Payload for column reordered event.
 */
export interface ColumnReorderedPayload {
  columnId: string;
  order: number;
  projectId: string;
  userId: string;
}

/**
 * Generic live update payload wrapper.
 * Includes metadata about who made the change.
 */
export interface LiveUpdateMeta {
  /** User who triggered the change */
  userId: string;
  /** Timestamp of the change */
  timestamp: number;
}

// -----------------------------------------------------------------------------
// Socket Data Types
// -----------------------------------------------------------------------------

/**
 * User information attached to authenticated sockets.
 */
export interface SocketUser {
  /** User's unique identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** User's avatar URL or null */
  avatar: string | null;
}

/**
 * Custom data attached to each socket connection.
 * Accessed via socket.data
 */
export interface SocketData {
  /** Authenticated user information */
  user: SocketUser;
}

// -----------------------------------------------------------------------------
// Typed Socket.io Server
// -----------------------------------------------------------------------------

/**
 * Type alias for creating a fully typed Socket.io server.
 *
 * Usage:
 * ```typescript
 * import { Server } from 'socket.io';
 * import type { TypedServer } from './types/presence.js';
 *
 * const io: TypedServer = new Server<
 *   ClientToServerEvents,
 *   ServerToClientEvents,
 *   InterServerEvents,
 *   SocketData
 * >(httpServer);
 * ```
 */
export type TypedServer = import('socket.io').Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Type alias for a fully typed socket instance.
 */
export type TypedSocket = import('socket.io').Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
