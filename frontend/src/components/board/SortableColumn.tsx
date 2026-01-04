'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { Task } from './Board';
import { ColumnHeader } from './ColumnHeader';
import { SortableTaskCard } from './SortableTaskCard';
import { AddTaskForm } from './AddTaskForm';

interface SortableColumnProps {
  id: string;
  name: string;
  tasks: Task[];
  taskCount?: number;
  projectId?: string;
  onAddTask?: (title: string) => void;
  onDeleteColumn?: () => void;
  onNameChange?: (newName: string) => void;
  onTaskClick?: (task: Task) => void;
  isEditable?: boolean;
  isDraggingTask?: boolean;
  className?: string;
}

export function SortableColumn({
  id,
  name,
  tasks,
  taskCount,
  projectId,
  onAddTask,
  onDeleteColumn,
  onNameChange,
  onTaskClick,
  isEditable = true,
  isDraggingTask = false,
  className,
}: SortableColumnProps) {
  // Sortable for column reordering
  const {
    attributes,
    listeners,
    setNodeRef: setColumnRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: `column-${id}`,
    data: {
      type: 'column',
      columnId: id,
    },
  });

  // Droppable for receiving tasks
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-droppable-${id}`,
    data: {
      type: 'column',
      columnId: id,
    },
  });

  // Delayed expand state - only expand after hovering for 150ms
  const [isExpandedDropZone, setIsExpandedDropZone] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOver && isDraggingTask && tasks.length === 0) {
      // Delay before expanding
      timeoutId = setTimeout(() => {
        setIsExpandedDropZone(true);
      }, 150);
    } else {
      // Immediately collapse when not hovering
      setIsExpandedDropZone(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOver, isDraggingTask, tasks.length]);

  const count = taskCount ?? tasks.length;
  const taskIds = tasks.map((task) => task.id);

  const columnStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setColumnRef}
      style={columnStyle}
      className={cn(
        'flex flex-col w-[300px] gap-4 flex-shrink-0',
        isColumnDragging && 'opacity-50',
        className
      )}
      data-column-id={id}
    >
      {/* Column Header - Drag Handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <ColumnHeader
          id={id}
          name={name}
          taskCount={count}
          projectId={projectId}
          onNameChange={onNameChange}
          onDelete={onDeleteColumn}
          isEditable={isEditable}
        />
      </div>

      {/* Tasks Container - Droppable Zone */}
      <div
        ref={setDroppableRef}
        className={cn(
          'flex flex-col gap-2.5 flex-1 overflow-y-auto scrollbar-hide p-1 -m-1',
          'transition-all duration-200 rounded-xl',
          // Only expand THIS column when hovering over it with a task (after delay)
          isExpandedDropZone ? 'min-h-[200px]' : 'min-h-[60px]',
          // Immediate visual feedback when hovering
          isOver && isDraggingTask && 'bg-blue-50 border-2 border-dashed border-blue-300'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>

        {/* Visual feedback when dragging over empty column (after delay) */}
        {isExpandedDropZone && (
          <div className="flex-1 flex items-center justify-center text-blue-500 text-sm font-medium pointer-events-none">
            Release to drop
          </div>
        )}

        {/* Add Task Form - only show when editable */}
        {isEditable && onAddTask && (
          <AddTaskForm
            onSubmit={(title) => onAddTask(title)}
            placeholder={`Add task to ${name}...`}
          />
        )}
      </div>
    </div>
  );
}

export default SortableColumn;
