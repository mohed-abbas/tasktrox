'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from './Board';
import { TaskCard } from './TaskCard';

interface SortableTaskCardProps {
  task: Task;
  onClick?: () => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

export function SortableTaskCard({ task, onClick, onToggleComplete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId: task.columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onClick={onClick}
        onToggleComplete={onToggleComplete}
        isDragging={isDragging}
      />
    </div>
  );
}

export default SortableTaskCard;
