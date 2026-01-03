'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSocket,
  emitEditingStart,
  emitEditingStop,
  onEditingActive,
  offEditingActive,
  onEditingInactive,
  offEditingInactive,
  type EditingField,
  type EditingActivePayload,
  type EditingInactivePayload,
} from '@/lib/socket';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Information about a user who is currently editing a field.
 */
export interface EditingUser {
  /** User's unique identifier */
  id: string;
  /** User's display name */
  name: string;
  /** User's avatar URL (optional) */
  avatar?: string;
}

/**
 * Options for the usePresence hook.
 */
export interface UsePresenceOptions {
  /** Project ID containing the task */
  projectId: string;
  /** Task ID being tracked for editing */
  taskId: string;
  /** Field type being tracked */
  field: EditingField;
  /** Whether presence tracking is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Return value from the usePresence hook.
 */
export interface UsePresenceReturn {
  /** User who is currently editing this field (null if no one) */
  editingUser: EditingUser | null;
  /** Convenience boolean for checking if field is being edited */
  isBeingEdited: boolean;
  /** Call when user starts editing this field */
  startEditing: () => void;
  /** Call when user stops editing this field */
  stopEditing: () => void;
}

// -----------------------------------------------------------------------------
// Hook Implementation
// -----------------------------------------------------------------------------

/**
 * Hook for tracking and emitting editing state for a specific task field.
 *
 * Provides real-time presence awareness by:
 * - Listening for other users editing the same field
 * - Emitting events when the current user starts/stops editing
 * - Auto-cleanup on unmount
 *
 * @example
 * ```tsx
 * const { editingUser, isBeingEdited, startEditing, stopEditing } = usePresence({
 *   projectId: 'proj_123',
 *   taskId: 'task_456',
 *   field: 'title',
 * });
 *
 * return (
 *   <input
 *     onFocus={startEditing}
 *     onBlur={stopEditing}
 *     disabled={isBeingEdited}
 *   />
 * );
 * ```
 */
export function usePresence({
  projectId,
  taskId,
  field,
  enabled = true,
}: UsePresenceOptions): UsePresenceReturn {
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);

  // Track if this hook instance is currently editing (to handle cleanup)
  const isEditingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Store options in refs for stable callback references
  const optionsRef = useRef({ projectId, taskId, field });
  optionsRef.current = { projectId, taskId, field };

  /**
   * Start editing - emit event to notify other users.
   */
  const startEditing = useCallback(() => {
    if (!enabled) return;

    const socket = getSocket();
    if (!socket.connected) {
      console.warn('[usePresence] Socket not connected, cannot emit editing:start');
      return;
    }

    const { projectId: pId, taskId: tId, field: f } = optionsRef.current;
    emitEditingStart(pId, tId, f);
    isEditingRef.current = true;
  }, [enabled]);

  /**
   * Stop editing - emit event to notify other users.
   */
  const stopEditing = useCallback(() => {
    if (!enabled) return;

    const socket = getSocket();
    if (!socket.connected) {
      console.warn('[usePresence] Socket not connected, cannot emit editing:stop');
      return;
    }

    const { projectId: pId, taskId: tId, field: f } = optionsRef.current;
    emitEditingStop(pId, tId, f);
    isEditingRef.current = false;
  }, [enabled]);

  /**
   * Subscribe to editing events and handle cleanup.
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    isMountedRef.current = true;

    // Handle when another user starts editing
    const handleEditingActive = (payload: EditingActivePayload) => {
      if (!isMountedRef.current) return;

      // Check if this event is for our task and field
      if (payload.taskId === taskId && payload.field === field) {
        setEditingUser({
          id: payload.user.id,
          name: payload.user.name,
          avatar: payload.user.avatar ?? undefined,
        });
      }
    };

    // Handle when another user stops editing
    const handleEditingInactive = (payload: EditingInactivePayload) => {
      if (!isMountedRef.current) return;

      // Check if this event is for our task and field
      // Clear the editing user when we receive an inactive event
      if (payload.taskId === taskId && payload.field === field) {
        setEditingUser(null);
      }
    };

    // Subscribe to events
    onEditingActive(handleEditingActive);
    onEditingInactive(handleEditingInactive);

    // Cleanup function
    return () => {
      isMountedRef.current = false;

      // Unsubscribe from events
      offEditingActive(handleEditingActive);
      offEditingInactive(handleEditingInactive);

      // If we were editing, emit stop event on cleanup
      if (isEditingRef.current) {
        const socket = getSocket();
        if (socket.connected) {
          const { projectId: pId, taskId: tId, field: f } = optionsRef.current;
          emitEditingStop(pId, tId, f);
          isEditingRef.current = false;
        }
      }
    };
  }, [projectId, taskId, field, enabled]);

  return {
    editingUser,
    isBeingEdited: editingUser !== null,
    startEditing,
    stopEditing,
  };
}

export default usePresence;
