'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from '@/components/task/PrioritySelector';
import { LabelBadge } from '@/components/labels';
import { AssigneeAvatarStack } from '@/components/task/AssigneeSelector';
import type { Task, ColumnWithTasks } from '@/components/board';

export interface GridViewProps {
  columns: ColumnWithTasks[];
  projectId: string;
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
}

// Card animation variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

// Format due date for display
function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get due date urgency
function getDueDateUrgency(
  dateStr: string | null
): 'overdue' | 'urgent' | 'soon' | 'normal' | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'urgent';
  if (diffDays <= 2) return 'soon';
  return 'normal';
}

interface TaskCardProps {
  task: Task;
  column: ColumnWithTasks;
  onClick?: () => void;
  index: number;
}

function TaskCard({ task, column, onClick, index }: TaskCardProps) {
  const dueDateText = formatDueDate(task.dueDate);
  const dueDateUrgency = getDueDateUrgency(task.dueDate);

  const dueDateClasses = {
    overdue: 'bg-red-50 text-red-600 border-red-200',
    urgent: 'bg-amber-50 text-amber-600 border-amber-200',
    soon: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    normal: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  return (
    <motion.div
      variants={cardVariants}
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-4',
        'cursor-pointer transition-colors',
        'hover:border-gray-300',
        'flex flex-col h-full'
      )}
    >
      {/* Column Badge */}
      <div className="mb-3">
        <span
          className={cn(
            'text-[10px] font-medium uppercase tracking-wider',
            'px-2 py-0.5 rounded-full',
            'bg-gray-100 text-gray-500'
          )}
        >
          {column.name}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 flex-shrink-0">
        {task.title}
      </h3>

      {/* Description Preview */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label) => (
            <LabelBadge key={label.id} label={label} size="sm" />
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-full">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: Metadata */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left: Priority + Due Date */}
          <div className="flex items-center gap-2">
            {task.priority && (
              <PriorityBadge priority={task.priority} size="sm" />
            )}
            {dueDateText && dueDateUrgency && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-md border',
                  dueDateClasses[dueDateUrgency]
                )}
              >
                <Calendar className="size-2.5 inline mr-0.5" />
                {dueDateText}
              </span>
            )}
          </div>

          {/* Right: Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <AssigneeAvatarStack assignees={task.assignees} max={3} size="sm" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function GridView({
  columns,
  projectId,
  isLoading = false,
  onTaskClick,
}: GridViewProps) {
  // Flatten all tasks with column reference
  const allTasks = useMemo(() => {
    const tasks: { task: Task; column: ColumnWithTasks }[] = [];
    columns.forEach((col) => {
      col.tasks.forEach((task) => {
        tasks.push({ task, column: col });
      });
    });
    return tasks;
  }, [columns]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl h-48"
          />
        ))}
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Clock className="size-12 mb-4 opacity-50" />
        <p className="text-sm">No tasks yet</p>
        <p className="text-xs mt-1">Create a task to see it here</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid Stats */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-gray-500">
          {allTasks.length} task{allTasks.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{columns.length} columns</span>
        </div>
      </div>

      {/* Task Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {allTasks.map(({ task, column }, index) => (
          <TaskCard
            key={task.id}
            task={task}
            column={column}
            onClick={() => onTaskClick?.(task)}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default GridView;
