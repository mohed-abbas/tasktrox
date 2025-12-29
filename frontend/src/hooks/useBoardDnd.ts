'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
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
  // State setters for external sync
  setLocalColumns: React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;
}

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
 */
export function useBoardDnd({
  columns,
  callbacks = {},
  activationDistance = 8,
}: UseBoardDndOptions): UseBoardDndReturn {
  const { onMoveTask, onReorderColumn } = callbacks;

  // Local optimistic state for columns
  const [localColumns, setLocalColumns] = useState<ColumnWithTasks[]>(columns);

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

  // Find column containing a task
  const findColumnByTaskId = useCallback(
    (taskId: string): string | undefined => {
      for (const column of localColumns) {
        if (column.tasks?.some((t) => t.id === taskId)) {
          return column.id;
        }
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
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;

      // Only handle task movement between columns
      if (activeData?.type !== 'task') return;

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
          const activeIndex = sortedColumns.findIndex(
            (col) => col.id === activeColumnId
          );
          const overIndex = sortedColumns.findIndex(
            (col) => col.id === overColumnId
          );

          if (activeIndex !== -1 && overIndex !== -1) {
            // Optimistically update local state
            setLocalColumns((prev) => {
              const newColumns = [...prev];
              const [movedColumn] = newColumns.splice(
                newColumns.findIndex((col) => col.id === activeColumnId),
                1
              );
              const targetIndex = newColumns.findIndex(
                (col) => col.id === overColumnId
              );
              newColumns.splice(targetIndex, 0, movedColumn);

              // Update order values
              return newColumns.map((col, index) => ({
                ...col,
                order: index,
              }));
            });

            // Call callback for API sync
            onReorderColumn?.(activeColumnId, overIndex);
          }
        }
        return;
      }

      // Handle task movement
      if (activeData?.type === 'task') {
        const taskId = active.id as string;
        const sourceColumnId = findColumnByTaskId(taskId);

        if (!sourceColumnId) return;

        // Determine target column and position
        let targetColumnId = sourceColumnId;
        let newOrder = 0;

        if (overData?.type === 'column') {
          // Dropped on a column (empty area or column header)
          targetColumnId = overData.columnId;
          const targetColumn = localColumns.find(
            (col) => col.id === targetColumnId
          );
          newOrder = targetColumn?.tasks?.length || 0;
        } else if (overData?.type === 'task') {
          // Dropped on another task
          const overTaskId = over.id as string;
          targetColumnId = findColumnByTaskId(overTaskId) || sourceColumnId;
          const targetColumn = localColumns.find(
            (col) => col.id === targetColumnId
          );
          const overTaskIndex =
            targetColumn?.tasks?.findIndex((t) => t.id === overTaskId) ?? 0;
          newOrder = overTaskIndex;
        }

        // Get current task order for comparison
        const sourceColumn = localColumns.find(
          (col) => col.id === sourceColumnId
        );
        const currentTaskOrder =
          sourceColumn?.tasks?.find((t) => t.id === taskId)?.order ?? -1;

        // Only trigger if position actually changed
        if (sourceColumnId !== targetColumnId || newOrder !== currentTaskOrder) {
          // Optimistically update local state for task movement
          setLocalColumns((prev) => {
            const newColumns = prev.map((col) => ({
              ...col,
              tasks: [...(col.tasks || [])],
            }));

            // Find and remove task from source column
            const sourceCol = newColumns.find(
              (col) => col.id === sourceColumnId
            );
            const taskIndex =
              sourceCol?.tasks.findIndex((t) => t.id === taskId) ?? -1;
            if (!sourceCol || taskIndex === -1) return prev;

            const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

            // Add task to target column at the right position
            const targetCol = newColumns.find(
              (col) => col.id === targetColumnId
            );
            if (!targetCol) return prev;

            movedTask.columnId = targetColumnId;
            movedTask.order = newOrder;
            targetCol.tasks.splice(newOrder, 0, movedTask);

            // Update order values for affected columns
            sourceCol.tasks.forEach((t, i) => (t.order = i));
            targetCol.tasks.forEach((t, i) => (t.order = i));

            return newColumns;
          });

          // Call callback for API sync
          onMoveTask?.(taskId, sourceColumnId, targetColumnId, newOrder);
        }
      }
    },
    [
      localColumns,
      sortedColumns,
      findColumnByTaskId,
      onMoveTask,
      onReorderColumn,
    ]
  );

  return {
    sensors,
    collisionDetection: closestCorners,
    activeItem,
    localColumns,
    sortedColumns,
    columnIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    setLocalColumns,
  };
}

export default useBoardDnd;
