'use client';

import { DndContext, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useBoardDnd } from '@/hooks/useBoardDnd';
import { SortableColumn } from './SortableColumn';
import { TaskCard } from './TaskCard';
import { AddColumn } from './AddColumn';
import type { Column as ColumnType } from '@/lib/api/projects';

// Types for tasks (will be expanded in 3.6.4)
export interface Task {
  id: string;
  title: string;
  description: string | null;
  order: number;
  columnId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  labels?: { id: string; name: string; color: string }[];
  assignees?: { id: string; name: string; avatar: string | null }[];
  _count?: { comments: number; attachments: number };
}

// Extended column type with tasks
export interface ColumnWithTasks extends ColumnType {
  tasks: Task[];
}

interface BoardProps {
  columns: ColumnWithTasks[];
  projectId: string;
  onAddTask?: (columnId: string, title: string) => void;
  onAddColumn?: (name: string) => void;
  onEditColumn?: (columnId: string, name: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onTaskClick?: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onMoveTask?: (taskId: string, sourceColumnId: string, targetColumnId: string, newOrder: number) => void;
  onReorderColumn?: (columnId: string, newOrder: number) => void;
  isLoading?: boolean;
  /** When true, disables drag-and-drop, task creation, and column editing (for VIEWER role) */
  readOnly?: boolean;
}

export function Board({
  columns,
  projectId,
  onAddTask,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onTaskClick,
  onToggleComplete,
  onMoveTask,
  onReorderColumn,
  isLoading = false,
  readOnly = false,
}: BoardProps) {
  // Use custom DnD hook for all drag-and-drop logic
  const {
    sensors,
    collisionDetection,
    activeItem,
    sortedColumns,
    columnIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBoardDnd({
    columns,
    callbacks: {
      onMoveTask,
      onReorderColumn,
    },
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex gap-4 h-full min-w-max p-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col w-[300px] bg-gray-50 rounded-xl animate-pulse"
          >
            <div className="px-3 py-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-gray-300" />
                  <div className="h-4 w-20 bg-gray-300 rounded" />
                </div>
                <div className="h-5 w-6 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex-1 px-3 pb-3 space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="bg-white rounded-card shadow-card p-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
            <Plus className="size-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-2">
            No columns yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {readOnly
              ? 'This project has no columns.'
              : 'Start by adding your first column to organize your tasks.'}
          </p>
          {!readOnly && (
            <AddColumn
              onSubmit={(name) => onAddColumn?.(name)}
              placeholder="e.g., To Do, In Progress, Done..."
            />
          )}
        </div>
      </div>
    );
  }

  // Render board content
  const boardContent = (
    <div className="flex gap-4 h-full min-w-max">
      {/* Sortable Columns */}
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        {sortedColumns.map((column) => (
          <SortableColumn
            key={column.id}
            id={column.id}
            name={column.name}
            tasks={column.tasks || []}
            projectId={projectId}
            onAddTask={readOnly ? undefined : (title) => onAddTask?.(column.id, title)}
            onNameChange={readOnly ? undefined : (newName) => onEditColumn?.(column.id, newName)}
            onDeleteColumn={readOnly ? undefined : () => onDeleteColumn?.(column.id)}
            onTaskClick={onTaskClick}
            onToggleComplete={readOnly ? undefined : onToggleComplete}
            isDraggingTask={activeItem?.type === 'task'}
            isEditable={!readOnly}
          />
        ))}
      </SortableContext>

      {/* Add Column Button - hide when read-only */}
      {!readOnly && <AddColumn onSubmit={(name) => onAddColumn?.(name)} />}
    </div>
  );

  // When read-only, don't use DnD context
  if (readOnly) {
    return boardContent;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {boardContent}

      {/* Drag Overlay - Shows preview of dragged item */}
      <DragOverlay>
        {activeItem?.type === 'task' && activeItem.task && (
          <TaskCard task={activeItem.task} isOverlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default Board;
