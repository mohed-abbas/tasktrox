'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { Task } from './Board';
import { ColumnHeader, columnHeaderConfig } from './ColumnHeader';
import { TaskCard } from './TaskCard';
import { AddTaskForm } from './AddTaskForm';

// Re-export columnConfig for backwards compatibility
export const columnConfig = columnHeaderConfig;

export interface ColumnProps {
  id: string;
  name: string;
  tasks: Task[];
  taskCount?: number;
  onAddTask?: (title: string) => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
  onNameChange?: (newName: string) => void;
  onTaskClick?: (task: Task) => void;
  renderTask?: (task: Task) => React.ReactNode;
  isOver?: boolean;
  isDragging?: boolean;
  isEditable?: boolean;
  className?: string;
}

export const Column = forwardRef<HTMLDivElement, ColumnProps>(
  (
    {
      id,
      name,
      tasks,
      taskCount,
      onAddTask,
      onEditColumn,
      onDeleteColumn,
      onNameChange,
      onTaskClick,
      renderTask,
      isOver = false,
      isDragging = false,
      isEditable = true,
      className,
    },
    ref
  ) => {
    const count = taskCount ?? tasks.length;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-[300px] gap-4 flex-shrink-0',
          isDragging && 'opacity-50',
          className
        )}
        data-column-id={id}
      >
        {/* Column Header */}
        <ColumnHeader
          id={id}
          name={name}
          taskCount={count}
          onNameChange={onNameChange}
          onEdit={onEditColumn}
          onDelete={onDeleteColumn}
          isEditable={isEditable}
        />

        {/* Tasks Container */}
        <div
          className={cn(
            'flex flex-col gap-2.5 min-h-[100px] flex-1 overflow-y-auto scrollbar-hide',
            isOver && 'bg-gray-100/50 rounded-xl'
          )}
        >
          {/* Task Cards */}
          {tasks.map((task) =>
            renderTask ? (
              renderTask(task)
            ) : (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            )
          )}

          {/* Add Task Form */}
          <AddTaskForm
            onSubmit={(title) => onAddTask?.(title)}
            placeholder={`Add task to ${name}...`}
          />
        </div>
      </div>
    );
  }
);

Column.displayName = 'Column';

export default Column;
