'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import type { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/query-client';
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  setSocketAuth,
  joinProject as socketJoinProject,
  leaveProject as socketLeaveProject,
  emitEditingStart,
  emitEditingStop,
  onEditingActive,
  offEditingActive,
  onEditingInactive,
  offEditingInactive,
  onPresenceSync,
  offPresenceSync,
  type EditingField,
  type EditingActivePayload,
  type EditingInactivePayload,
  type PresenceSyncPayload,
  type ServerToClientEvents,
  type ClientToServerEvents,
  type TaskCreatedPayload,
  type TaskUpdatedPayload,
  type TaskDeletedPayload,
  type TaskMovedPayload,
  type TaskReorderedPayload,
  type ColumnCreatedPayload,
  type ColumnUpdatedPayload,
  type ColumnDeletedPayload,
  type ColumnReorderedPayload,
  type CommentCreatedPayload,
  type CommentUpdatedPayload,
  type CommentDeletedPayload,
} from '@/lib/socket';

// Types
export interface EditingUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface PresenceState {
  [key: string]: EditingUser; // key is "taskId:field"
}

export interface SocketContextValue {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  presence: PresenceState;
  startEditing: (projectId: string, taskId: string, field: EditingField) => void;
  stopEditing: (projectId: string, taskId: string, field: EditingField) => void;
  isEditing: (taskId: string, field: EditingField) => EditingUser | null;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

export type { EditingField };

// Context
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

// Provider component
export function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceState>({});
  const [socketInstance, setSocketInstance] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const isMountedRef = useRef(true);

  // Get presence key from taskId and field
  const getPresenceKey = useCallback(
    (taskId: string, field: EditingField): string => {
      return `${taskId}:${field}`;
    },
    []
  );

  // Handle editing:active event
  const handleEditingActive = useCallback(
    (payload: EditingActivePayload) => {
      if (!isMountedRef.current) return;

      const key = getPresenceKey(payload.taskId, payload.field);
      setPresence((prev) => ({
        ...prev,
        [key]: {
          id: payload.user.id,
          name: payload.user.name,
          avatar: payload.user.avatar,
        },
      }));
    },
    [getPresenceKey]
  );

  // Handle editing:inactive event
  const handleEditingInactive = useCallback(
    (payload: EditingInactivePayload) => {
      if (!isMountedRef.current) return;

      const key = getPresenceKey(payload.taskId, payload.field);
      setPresence((prev) => {
        const newPresence = { ...prev };
        delete newPresence[key];
        return newPresence;
      });
    },
    [getPresenceKey]
  );

  // Handle presence:sync event
  const handlePresenceSync = useCallback((_payload: PresenceSyncPayload) => {
    if (!isMountedRef.current) return;

    // Presence sync provides list of users in a project room
    // This is typically used to show who's online, not who's editing
    // For now, we just acknowledge the event - can be extended later
    // to track online users separately from editing state
  }, []);

  // Live Update Handlers
  // These handlers invalidate React Query caches when changes are received from other users

  const handleTaskCreated = useCallback(
    (payload: TaskCreatedPayload) => {
      if (!isMountedRef.current) return;
      // Skip if current user made the change
      if (payload.meta.userId === user?.id) return;

      const projectId = payload.task.column?.projectId;
      if (projectId) {
        // Invalidate project data (includes columns) and tasks list
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        toast.info('A new task was created');
      }
    },
    [user?.id]
  );

  const handleTaskUpdated = useCallback(
    (payload: TaskUpdatedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      const projectId = payload.task.column?.projectId;
      if (projectId) {
        // Invalidate project, tasks list, and specific task
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        queryClient.invalidateQueries({ queryKey: ['task', projectId, payload.task.id] });
        toast.info('A task was updated');
      }
    },
    [user?.id]
  );

  const handleTaskDeleted = useCallback(
    (payload: TaskDeletedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate project and tasks list
      queryClient.invalidateQueries({ queryKey: ['project', payload.projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', payload.projectId] });
      toast.info('A task was deleted');
    },
    [user?.id]
  );

  const handleTaskMoved = useCallback(
    (payload: TaskMovedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate project and tasks list
      queryClient.invalidateQueries({ queryKey: ['project', payload.projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', payload.projectId] });
      toast.info('A task was moved');
    },
    [user?.id]
  );

  const handleTaskReordered = useCallback(
    (payload: TaskReorderedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate tasks list for reorder
      queryClient.invalidateQueries({ queryKey: ['tasks', payload.projectId] });
    },
    [user?.id]
  );

  const handleColumnCreated = useCallback(
    (payload: ColumnCreatedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate project data (includes columns)
      queryClient.invalidateQueries({ queryKey: ['project', payload.column.projectId] });
      toast.info('A new column was created');
    },
    [user?.id]
  );

  const handleColumnUpdated = useCallback(
    (payload: ColumnUpdatedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate project data (includes columns)
      queryClient.invalidateQueries({ queryKey: ['project', payload.column.projectId] });
      toast.info('A column was updated');
    },
    [user?.id]
  );

  const handleColumnDeleted = useCallback(
    (payload: ColumnDeletedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate project data (includes columns)
      queryClient.invalidateQueries({ queryKey: ['project', payload.projectId] });
      toast.info('A column was deleted');
    },
    [user?.id]
  );

  const handleColumnReordered = useCallback(
    (payload: ColumnReorderedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate project data for column reorder
      queryClient.invalidateQueries({ queryKey: ['project', payload.projectId] });
    },
    [user?.id]
  );

  // Comment Live Update Handlers
  const handleCommentCreated = useCallback(
    (payload: CommentCreatedPayload) => {
      if (!isMountedRef.current) return;
      // Skip if current user made the change (already updated via mutation)
      if (payload.meta.userId === user?.id) return;

      // Invalidate comments query for this task
      queryClient.invalidateQueries({
        queryKey: ['comments'],
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Match ['comments', projectId, taskId] pattern
          return queryKey[0] === 'comments' && queryKey[2] === payload.comment.taskId;
        },
      });
      toast.info('New comment added');
    },
    [user?.id]
  );

  const handleCommentUpdated = useCallback(
    (payload: CommentUpdatedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate comments query for this task
      queryClient.invalidateQueries({
        queryKey: ['comments'],
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'comments' && queryKey[2] === payload.comment.taskId;
        },
      });
    },
    [user?.id]
  );

  const handleCommentDeleted = useCallback(
    (payload: CommentDeletedPayload) => {
      if (!isMountedRef.current) return;
      if (payload.meta.userId === user?.id) return;

      // Invalidate comments query for this task
      queryClient.invalidateQueries({
        queryKey: ['comments'],
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'comments' && queryKey[2] === payload.taskId;
        },
      });
      toast.info('A comment was deleted');
    },
    [user?.id]
  );

  // Handle socket connect event
  const handleConnect = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsConnected(true);
  }, []);

  // Handle socket disconnect event
  const handleDisconnect = useCallback((_reason: string) => {
    if (!isMountedRef.current) return;
    setIsConnected(false);
    setPresence({});
  }, []);

  // Handle socket connection error
  const handleConnectError = useCallback((error: Error) => {
    console.error('[SocketProvider] Socket connection error:', error.message);
  }, []);

  // Connect/disconnect based on accessToken
  useEffect(() => {
    isMountedRef.current = true;

    if (!accessToken) {
      // No token - disconnect if connected
      disconnectSocket();
      setIsConnected(false);
      setPresence({});
      setSocketInstance(null);
      return;
    }

    // Set auth and connect
    setSocketAuth(accessToken);
    connectSocket(accessToken);

    const socket = getSocket();
    if (!socket) {
      console.error('[SocketProvider] Failed to get socket instance');
      return;
    }

    // Store socket instance in state for context
    setSocketInstance(socket);

    // Set up connection listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set up presence event listeners
    onEditingActive(handleEditingActive);
    onEditingInactive(handleEditingInactive);
    onPresenceSync(handlePresenceSync);

    // Set up live update event listeners
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:reordered', handleTaskReordered);
    socket.on('column:created', handleColumnCreated);
    socket.on('column:updated', handleColumnUpdated);
    socket.on('column:deleted', handleColumnDeleted);
    socket.on('column:reordered', handleColumnReordered);

    // Set up comment live update event listeners
    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:updated', handleCommentUpdated);
    socket.on('comment:deleted', handleCommentDeleted);

    // Update connected state if already connected
    if (socket.connected) {
      setIsConnected(true);
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;

      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      offEditingActive(handleEditingActive);
      offEditingInactive(handleEditingInactive);
      offPresenceSync(handlePresenceSync);

      // Remove live update event listeners
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:reordered', handleTaskReordered);
      socket.off('column:created', handleColumnCreated);
      socket.off('column:updated', handleColumnUpdated);
      socket.off('column:deleted', handleColumnDeleted);
      socket.off('column:reordered', handleColumnReordered);

      // Remove comment live update event listeners
      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:updated', handleCommentUpdated);
      socket.off('comment:deleted', handleCommentDeleted);

      disconnectSocket();
    };
  }, [
    accessToken,
    handleConnect,
    handleDisconnect,
    handleConnectError,
    handleEditingActive,
    handleEditingInactive,
    handlePresenceSync,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskMoved,
    handleTaskReordered,
    handleColumnCreated,
    handleColumnUpdated,
    handleColumnDeleted,
    handleColumnReordered,
    handleCommentCreated,
    handleCommentUpdated,
    handleCommentDeleted,
  ]);

  // Start editing a field
  const startEditing = useCallback(
    (projectId: string, taskId: string, field: EditingField) => {
      emitEditingStart(projectId, taskId, field);
    },
    []
  );

  // Stop editing a field
  const stopEditing = useCallback(
    (projectId: string, taskId: string, field: EditingField) => {
      emitEditingStop(projectId, taskId, field);
    },
    []
  );

  // Check if someone is editing a field
  const isEditing = useCallback(
    (taskId: string, field: EditingField): EditingUser | null => {
      const key = getPresenceKey(taskId, field);
      return presence[key] || null;
    },
    [presence, getPresenceKey]
  );

  // Join a project room
  const joinProject = useCallback((projectId: string) => {
    socketJoinProject(projectId);
  }, []);

  // Leave a project room
  const leaveProject = useCallback((projectId: string) => {
    socketLeaveProject(projectId);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        isConnected,
        presence,
        startEditing,
        stopEditing,
        isEditing,
        joinProject,
        leaveProject,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// Hook to use socket context
export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
