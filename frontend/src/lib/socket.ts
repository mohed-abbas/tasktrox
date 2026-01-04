import { io, Socket } from 'socket.io-client';

// Socket URL should be the base server URL without /api/v1 path
// Strip /api/v1 from NEXT_PUBLIC_API_URL if present, or use dedicated socket URL
const getSocketUrl = (): string => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (socketUrl) return socketUrl;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  // Remove /api/v1 suffix if present (Socket.io connects to base URL)
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

const SOCKET_URL = getSocketUrl();

// Field types for editing events
export type EditingField = 'title' | 'description' | 'column-name';

// Payload types
export interface EditingPayload {
  projectId: string;
  taskId: string;
  field: EditingField;
}

export interface EditingActivePayload {
  taskId: string;
  field: EditingField;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface EditingInactivePayload {
  taskId: string;
  field: EditingField;
  userId: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface PresenceSyncPayload {
  projectId: string;
  users: PresenceUser[];
}

// Live update payload types
export interface LiveUpdateMeta {
  userId: string;
  timestamp: number;
}

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
  column?: {
    id: string;
    name: string;
    projectId: string;
  };
}

export interface LiveColumn {
  id: string;
  name: string;
  order: number;
  color: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreatedPayload {
  task: LiveTask;
  meta: LiveUpdateMeta;
}

export interface TaskUpdatedPayload {
  task: LiveTask;
  meta: LiveUpdateMeta;
}

export interface TaskDeletedPayload {
  taskId: string;
  columnId: string;
  projectId: string;
  meta: LiveUpdateMeta;
}

export interface TaskMovedPayload {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  order: number;
  projectId: string;
  userId: string;
  meta: LiveUpdateMeta;
}

export interface TaskReorderedPayload {
  taskId: string;
  columnId: string;
  order: number;
  projectId: string;
  userId: string;
  meta: LiveUpdateMeta;
}

export interface ColumnCreatedPayload {
  column: LiveColumn;
  meta: LiveUpdateMeta;
}

export interface ColumnUpdatedPayload {
  column: LiveColumn;
  meta: LiveUpdateMeta;
}

export interface ColumnDeletedPayload {
  columnId: string;
  projectId: string;
  meta: LiveUpdateMeta;
}

export interface ColumnReorderedPayload {
  columnId: string;
  order: number;
  projectId: string;
  userId: string;
  meta: LiveUpdateMeta;
}

// Comment live update types
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

export interface CommentCreatedPayload {
  comment: LiveComment;
  meta: LiveUpdateMeta;
}

export interface CommentUpdatedPayload {
  comment: LiveComment;
  meta: LiveUpdateMeta;
}

export interface CommentDeletedPayload {
  commentId: string;
  taskId: string;
  projectId: string;
  meta: LiveUpdateMeta;
}

// Attachment live update types
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

export interface AttachmentUploadedPayload {
  attachment: LiveAttachment;
  meta: LiveUpdateMeta;
}

export interface AttachmentDeletedPayload {
  attachmentId: string;
  taskId: string;
  projectId: string;
  meta: LiveUpdateMeta;
}

// Socket.io typed events
export interface ClientToServerEvents {
  'project:join': (projectId: string) => void;
  'project:leave': (projectId: string) => void;
  'editing:start': (payload: EditingPayload) => void;
  'editing:stop': (payload: EditingPayload) => void;
}

export interface ServerToClientEvents {
  // Presence events
  'editing:active': (payload: EditingActivePayload) => void;
  'editing:inactive': (payload: EditingInactivePayload) => void;
  'presence:sync': (payload: PresenceSyncPayload) => void;
  // Task live update events
  'task:created': (payload: TaskCreatedPayload) => void;
  'task:updated': (payload: TaskUpdatedPayload) => void;
  'task:deleted': (payload: TaskDeletedPayload) => void;
  'task:moved': (payload: TaskMovedPayload) => void;
  'task:reordered': (payload: TaskReorderedPayload) => void;
  // Column live update events
  'column:created': (payload: ColumnCreatedPayload) => void;
  'column:updated': (payload: ColumnUpdatedPayload) => void;
  'column:deleted': (payload: ColumnDeletedPayload) => void;
  'column:reordered': (payload: ColumnReorderedPayload) => void;
  // Comment live update events
  'comment:created': (payload: CommentCreatedPayload) => void;
  'comment:updated': (payload: CommentUpdatedPayload) => void;
  'comment:deleted': (payload: CommentDeletedPayload) => void;
  // Attachment live update events
  'attachment:uploaded': (payload: AttachmentUploadedPayload) => void;
  'attachment:deleted': (payload: AttachmentDeletedPayload) => void;
}

// Typed socket instance
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;
let authToken: string | null = null;

/**
 * Get or create the socket instance
 */
export function getSocket(): TypedSocket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: authToken ? { token: authToken } : undefined,
    }) as TypedSocket;
  }
  return socket;
}

/**
 * Set authentication token for socket connection
 * Call this after user login before connecting
 */
export function setSocketAuth(token: string): void {
  authToken = token;
  if (socket) {
    socket.auth = { token };
  }
}

/**
 * Clear authentication token
 * Call this on logout
 */
export function clearSocketAuth(): void {
  authToken = null;
  if (socket) {
    socket.auth = {};
  }
}

/**
 * Connect the socket with optional token
 */
export function connectSocket(token?: string): void {
  if (token) {
    setSocketAuth(token);
  }

  const s = getSocket();

  // Update auth if token was provided
  if (token) {
    s.auth = { token };
  }

  if (!s.connected) {
    s.connect();
  }
}

/**
 * Disconnect the socket
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Join a project room for real-time updates
 */
export function joinProject(projectId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('project:join', projectId);
  }
}

/**
 * Leave a project room
 */
export function leaveProject(projectId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('project:leave', projectId);
  }
}

/**
 * Emit editing start event
 */
export function emitEditingStart(
  projectId: string,
  taskId: string,
  field: EditingField
): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('editing:start', { projectId, taskId, field });
  }
}

/**
 * Emit editing stop event
 */
export function emitEditingStop(
  projectId: string,
  taskId: string,
  field: EditingField
): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('editing:stop', { projectId, taskId, field });
  }
}

// Event listener types
type EditingActiveCallback = (payload: EditingActivePayload) => void;
type EditingInactiveCallback = (payload: EditingInactivePayload) => void;
type PresenceSyncCallback = (payload: PresenceSyncPayload) => void;

/**
 * Subscribe to editing:active events
 */
export function onEditingActive(callback: EditingActiveCallback): void {
  const s = getSocket();
  s.on('editing:active', callback);
}

/**
 * Unsubscribe from editing:active events
 */
export function offEditingActive(callback: EditingActiveCallback): void {
  const s = getSocket();
  s.off('editing:active', callback);
}

/**
 * Subscribe to editing:inactive events
 */
export function onEditingInactive(callback: EditingInactiveCallback): void {
  const s = getSocket();
  s.on('editing:inactive', callback);
}

/**
 * Unsubscribe from editing:inactive events
 */
export function offEditingInactive(callback: EditingInactiveCallback): void {
  const s = getSocket();
  s.off('editing:inactive', callback);
}

/**
 * Subscribe to presence:sync events
 */
export function onPresenceSync(callback: PresenceSyncCallback): void {
  const s = getSocket();
  s.on('presence:sync', callback);
}

/**
 * Unsubscribe from presence:sync events
 */
export function offPresenceSync(callback: PresenceSyncCallback): void {
  const s = getSocket();
  s.off('presence:sync', callback);
}
