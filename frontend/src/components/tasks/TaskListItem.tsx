'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { GlobalTask } from '@/lib/api/tasks';

interface TaskListItemProps {
  task: GlobalTask;
  onToggleComplete: (task: GlobalTask, completed: boolean) => void;
  isToggling?: boolean;
  isCompleted?: boolean;
}

// Priority badge colors
const priorityColors = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
};

// Format due date for display
function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (taskDate < today) {
    return 'Overdue';
  } else if (taskDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

// Check if task is overdue
function isOverdue(dueDate: string | null, completedAt: string | null): boolean {
  if (!dueDate || completedAt) return false;
  return new Date(dueDate) < new Date();
}

export function TaskListItem({
  task,
  onToggleComplete,
  isToggling = false,
  isCompleted = false,
}: TaskListItemProps) {
  const router = useRouter();
  const dueDateLabel = formatDueDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.completedAt);

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox
    if ((e.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    // Navigate to project with task selected
    router.push(`/projects/${task.project.id}?task=${task.id}`);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onToggleComplete(task, checked);
  };

  return (
    <div
      onClick={handleRowClick}
      className={cn(
        'group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm',
        isCompleted && 'bg-gray-50'
      )}
    >
      {/* Checkbox */}
      <div data-checkbox className="flex-shrink-0">
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
        )}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium text-gray-900 truncate',
              isCompleted && 'line-through text-gray-500'
            )}
          >
            {task.title}
          </span>
          {task.priority && !isCompleted && (
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}
            >
              {task.priority}
            </Badge>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-1">
          {/* Project badge */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: task.project.color }}
            />
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {task.project.name}
            </span>
          </div>

          {/* Column name */}
          <span className="text-xs text-gray-400">{task.column.name}</span>

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignees.slice(0, 3).map((assignee) => (
                <Avatar key={assignee.id} className="h-5 w-5 border border-white">
                  <AvatarImage src={assignee.avatar || undefined} />
                  <AvatarFallback className="text-[8px] bg-gray-100">
                    {assignee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                  <span className="text-[8px] text-gray-600">
                    +{task.assignees.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Due Date */}
      {dueDateLabel && !isCompleted && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs flex-shrink-0',
            overdue ? 'text-red-600' : 'text-gray-500'
          )}
        >
          <Calendar className="h-3 w-3" />
          <span>{dueDateLabel}</span>
        </div>
      )}
    </div>
  );
}

export default TaskListItem;
