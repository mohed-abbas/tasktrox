'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import type { Task, ColumnWithTasks } from '@/components/board/Board';

// Active drag item state
export interface ActiveDragItem {
  type: 'task' | 'column';
  id: string;
  task?: Task;
  columnId?: string;
}

// Callback types for external state updates
export interface BoardDndCallbacks {
  onMoveTask?: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newOrder: number
  ) => void;
  onReorderColumn?: (columnId: string, newOrder: number) => void;
}

// Hook configuration options
export interface UseBoardDndOptions {
  columns: ColumnWithTasks[];
  callbacks?: BoardDndCallbacks;
  activationDistance?: number; // Pixels before drag activates (default: 8)
}

// Hook return type
export interface UseBoardDndReturn {
  // Sensors for DndContext
  sensors: ReturnType<typeof useSensors>;
  // Collision detection strategy
  collisionDetection: CollisionDetection;
  // Currently dragged item (for DragOverlay)
  activeItem: ActiveDragItem | null;
  // Local columns state (optimistically updated)
  localColumns: ColumnWithTasks[];
  // Sorted columns by order
  sortedColumns: ColumnWithTasks[];
  // Column IDs for SortableContext
  columnIds: string[];
  // Event handlers
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Custom collision detection that combines multiple strategies:
 * 1. pointerWithin - Best for dropping into empty columns
 * 2. closestCorners - Best for precise task reordering
 *
 * This hybrid approach makes empty columns easier to target
 * while maintaining precise task-to-task ordering.
 */
const customCollisionDetection: CollisionDetection = (args) => {
  // First, check if pointer is directly within any droppable (best for columns)
  const pointerCollisions = pointerWithin(args);

  // If we have pointer collisions, prioritize column droppables for empty column drops
  if (pointerCollisions.length > 0) {
    // Check if any collision is a column droppable (for empty columns)
    const columnCollision = pointerCollisions.find(
      (collision) => collision.id.toString().startsWith('column-droppable-')
    );

    // If hovering over a column droppable and there are task collisions too,
    // prefer the task collision for precise ordering
    const taskCollision = pointerCollisions.find(
      (collision) => !collision.id.toString().startsWith('column-')
    );

    if (taskCollision) {
      return [taskCollision];
    }

    if (columnCollision) {
      return [columnCollision];
    }

    return pointerCollisions;
  }

  // Fall back to closest corners for edge cases
  return closestCorners(args);
};

/**
 * Custom hook for managing Kanban board drag-and-drop functionality.
 * Extracts DnD logic from Board component for reusability and testability.
 *
 * Features:
 * - Column reordering (horizontal drag)
 * - Task movement between columns
 * - Task reordering within columns
 * - Optimistic local state updates
 * - Configurable activation distance
 * - Custom collision detection for better empty column targeting
 */
export function useBoardDnd({
  columns,
  callbacks = {},
  activationDistance = 8,
}: UseBoardDndOptions): UseBoardDndReturn {
  const { onMoveTask, onReorderColumn } = callbacks;

  // Local optimistic state for columns
  const [localColumns, setLocalColumns] = useState<ColumnWithTasks[]>(columns);

  // Sync local state when props change (e.g., from React Query refetch)
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  // Active drag item state
  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort columns by order
  const sortedColumns = useMemo(() => {
    return [...localColumns].sort((a, b) => a.order - b.order);
  }, [localColumns]);

  // Column IDs for sortable context (prefixed for uniqueness)
  const columnIds = useMemo(() => {
    return sortedColumns.map((col) => `column-${col.id}`);
  }, [sortedColumns]);

  // Find task by ID across all columns
  const findTask = useCallback(
    (taskId: string): Task | undefined => {
      for (const column of localColumns) {
        const task = column.tasks?.find((t) => t.id === taskId);
        if (task) return task;
      }
      return undefined;
    },
    [localColumns]
  );

  // Handle drag start - set active item for overlay
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeData = active.data.current;

      if (activeData?.type === 'task') {
        const task = findTask(active.id as string);
        if (task) {
          setActiveItem({
            type: 'task',
            id: active.id as string,
            task,
            columnId: task.columnId,
          });
        }
      } else if (activeData?.type === 'column') {
        setActiveItem({
          type: 'column',
          id: activeData.columnId,
          columnId: activeData.columnId,
        });
      }
    },
    [findTask]
  );

  // Handle drag over - for cross-column movement preview (future enhancement)
  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      // Future: Add real-time preview state for cross-column movement
      // For now, movement is handled in handleDragEnd
    },
    []
  );

  // Handle drag end - perform actual reordering
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Clear active item regardless of outcome
      setActiveItem(null);

      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Handle column reordering
      if (activeData?.type === 'column') {
        const activeColumnId = activeData.columnId;
        const overColumnId = overData?.columnId;

        if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
          // Calculate new order before state update
          const sorted = [...localColumns].sort((a, b) => a.order - b.order);
          const activeIndex = sorted.findIndex((col) => col.id === activeColumnId);
          const overIndex = sorted.findIndex((col) => col.id === overColumnId);

          if (activeIndex === -1 || overIndex === -1) return;

          // Update local state for immediate visual feedback
          setLocalColumns(() => {
            const reordered = arrayMove(sorted, activeIndex, overIndex);
            return reordered.map((col, index) => ({
              ...col,
              order: index,
            }));
          });

          // Call callback for API sync immediately (not in setTimeout)
          onReorderColumn?.(activeColumnId, overIndex);
        }
        return;
      }

      // Handle task movement
      if (activeData?.type === 'task') {
        const taskId = active.id as string;

        setLocalColumns((currentColumns) => {
          // Find source column
          let sourceColumnId: string | undefined;
          for (const column of currentColumns) {
            if (column.tasks?.some((t) => t.id === taskId)) {
              sourceColumnId = column.id;
              break;
            }
          }

          if (!sourceColumnId) return currentColumns;

          // Determine target column and position
          let targetColumnId = sourceColumnId;
          let newOrder = 0;

          if (overData?.type === 'column') {
            // Dropped on a column (empty area or column header)
            targetColumnId = overData.columnId;
            const targetColumn = currentColumns.find(
              (col) => col.id === targetColumnId
            );
            newOrder = targetColumn?.tasks?.length || 0;
          } else if (overData?.type === 'task') {
            // Dropped on another task
            const overTaskId = over.id as string;
            // Find which column contains the over task
            for (const column of currentColumns) {
              if (column.tasks?.some((t) => t.id === overTaskId)) {
                targetColumnId = column.id;
                break;
              }
            }
            const targetColumn = currentColumns.find(
              (col) => col.id === targetColumnId
            );
            const overTaskIndex =
              targetColumn?.tasks?.findIndex((t) => t.id === overTaskId) ?? 0;
            newOrder = overTaskIndex;
          }

          // Get current task index
          const sourceColumn = currentColumns.find(
            (col) => col.id === sourceColumnId
          );
          const currentTaskIndex =
            sourceColumn?.tasks?.findIndex((t) => t.id === taskId) ?? -1;

          if (currentTaskIndex === -1) return currentColumns;

          // Same column reordering - use arrayMove for correct behavior
          if (sourceColumnId === targetColumnId) {
            // Check if same position (no change needed)
            if (currentTaskIndex === newOrder) {
              return currentColumns;
            }

            // Create new columns with arrayMove for the target column
            const newColumns = currentColumns.map((col) => {
              if (col.id === targetColumnId) {
                const reorderedTasks = arrayMove(
                  [...(col.tasks || [])],
                  currentTaskIndex,
                  newOrder
                );
                // Update order values
                reorderedTasks.forEach((t, i) => (t.order = i));
                return { ...col, tasks: reorderedTasks };
              }
              return col;
            });

            // Call callback for API sync
            setTimeout(() => {
              onMoveTask?.(taskId, sourceColumnId!, targetColumnId, newOrder);
            }, 0);

            return newColumns;
          }

          // Cross-column movement
          const newColumns = currentColumns.map((col) => ({
            ...col,
            tasks: [...(col.tasks || [])],
          }));

          // Find and remove task from source column
          const sourceCol = newColumns.find((col) => col.id === sourceColumnId);
          if (!sourceCol) return currentColumns;

          const [movedTask] = sourceCol.tasks.splice(currentTaskIndex, 1);

          // Add task to target column at the right position
          const targetCol = newColumns.find((col) => col.id === targetColumnId);
          if (!targetCol) return currentColumns;

          movedTask.columnId = targetColumnId;
          movedTask.order = newOrder;
          targetCol.tasks.splice(newOrder, 0, movedTask);

          // Update order values for affected columns
          sourceCol.tasks.forEach((t, i) => (t.order = i));
          targetCol.tasks.forEach((t, i) => (t.order = i));

          // Call callback for API sync
          setTimeout(() => {
            onMoveTask?.(taskId, sourceColumnId!, targetColumnId, newOrder);
          }, 0);

          return newColumns;
        });
      }
    },
    [localColumns, onMoveTask, onReorderColumn]
  );

  return {
    sensors,
    collisionDetection: customCollisionDetection,
    activeItem,
    localColumns,
    sortedColumns,
    columnIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

export default useBoardDnd;
