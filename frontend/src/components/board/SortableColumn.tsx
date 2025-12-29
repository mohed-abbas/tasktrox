'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { Task } from './Board';
import { ColumnHeader, columnHeaderConfig } from './ColumnHeader';
import { SortableTaskCard } from './SortableTaskCard';
import { AddTaskForm } from './AddTaskForm';

interface SortableColumnProps {
  id: string;
  name: string;
  tasks: Task[];
  taskCount?: number;
  onAddTask?: (title: string) => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
  onNameChange?: (newName: string) => void;
  onTaskClick?: (task: Task) => void;
  isEditable?: boolean;
  className?: string;
}

export function SortableColumn({
  id,
  name,
  tasks,
  taskCount,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onNameChange,
  onTaskClick,
  isEditable = true,
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
          onNameChange={onNameChange}
          onEdit={onEditColumn}
          onDelete={onDeleteColumn}
          isEditable={isEditable}
        />
      </div>

      {/* Tasks Container - Droppable Zone */}
      <div
        ref={setDroppableRef}
        className={cn(
          'flex flex-col gap-2.5 min-h-[100px] flex-1 overflow-y-auto scrollbar-hide p-1 -m-1',
          'transition-colors duration-200',
          isOver && 'bg-gray-100/50 rounded-xl'
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

        {/* Add Task Form */}
        <AddTaskForm
          onSubmit={(title) => onAddTask?.(title)}
          placeholder={`Add task to ${name}...`}
        />
      </div>
    </div>
  );
}

export default SortableColumn;
