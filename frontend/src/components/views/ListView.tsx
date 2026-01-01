'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from '@/components/task/PrioritySelector';
import { LabelBadge } from '@/components/labels';
import { AssigneeAvatarStack } from '@/components/task/AssigneeSelector';
import type { Task, ColumnWithTasks } from '@/components/board';

export interface ListViewProps {
  columns: ColumnWithTasks[];
  projectId: string;
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
}

// Row animation variants
const rowVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15 },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.1 },
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
  if (diffDays <= 7) return `${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get due date color
function getDueDateColor(dateStr: string | null): string {
  if (!dateStr) return 'text-gray-400';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'text-red-600';
  if (diffDays === 0) return 'text-amber-600';
  if (diffDays <= 2) return 'text-amber-500';
  return 'text-gray-500';
}

interface ColumnSectionProps {
  column: ColumnWithTasks;
  onTaskClick?: (task: Task) => void;
  defaultExpanded?: boolean;
}

function ColumnSection({
  column,
  onTaskClick,
  defaultExpanded = true,
}: ColumnSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 last:mb-0">
      {/* Column Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2',
          'bg-gray-50 rounded-lg',
          'hover:bg-gray-100 transition-colors',
          'text-left'
        )}
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="size-4 text-gray-400" />
        </motion.div>
        <span className="text-sm font-medium text-gray-700">{column.name}</span>
        <span className="text-xs text-gray-400 ml-auto">
          {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Tasks List */}
      <AnimatePresence>
        {expanded && column.tasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 divide-y divide-gray-100 border border-gray-100 rounded-lg bg-white overflow-hidden">
              {column.tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  onClick?: () => void;
  index: number;
}

function TaskRow({ task, onClick, index }: TaskRowProps) {
  const dueDateText = formatDueDate(task.dueDate);
  const dueDateColor = getDueDateColor(task.dueDate);

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5',
        'hover:bg-gray-50 cursor-pointer',
        'transition-colors group'
      )}
    >
      {/* Drag Handle (visual only for now) */}
      <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
        <GripVertical className="size-4" />
      </div>

      {/* Priority */}
      <div className="w-20 flex-shrink-0">
        {task.priority ? (
          <PriorityBadge priority={task.priority} size="sm" />
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 truncate block">
          {task.title}
        </span>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {task.labels.slice(0, 2).map((label) => (
            <LabelBadge key={label.id} label={label} size="sm" />
          ))}
          {task.labels.length > 2 && (
            <span className="text-xs text-gray-400">
              +{task.labels.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Assignees */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="flex-shrink-0">
          <AssigneeAvatarStack assignees={task.assignees} max={2} size="sm" />
        </div>
      )}

      {/* Due Date */}
      <div className={cn('w-24 text-right flex-shrink-0', dueDateColor)}>
        {dueDateText ? (
          <span className="text-xs flex items-center justify-end gap-1">
            <Calendar className="size-3" />
            {dueDateText}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>
    </motion.div>
  );
}

export function ListView({
  columns,
  projectId,
  isLoading = false,
  onTaskClick,
}: ListViewProps) {
  // Sort columns by order
  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order),
    [columns]
  );

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="space-y-1">
              {[1, 2].map((j) => (
                <div key={j} className="h-12 bg-gray-50 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Clock className="size-12 mb-4 opacity-50" />
        <p className="text-sm">No columns yet</p>
        <p className="text-xs mt-1">Create a column to get started</p>
      </div>
    );
  }

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <div className="w-4" /> {/* Space for drag handle */}
          <div className="w-20">Priority</div>
          <div>Title</div>
        </div>
        <div className="flex items-center gap-4">
          <span>Labels</span>
          <span>Assigned</span>
          <div className="w-24 text-right">Due</div>
        </div>
      </div>

      {/* Column Sections */}
      <div>
        {sortedColumns.map((column) => (
          <ColumnSection
            key={column.id}
            column={column}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="pt-4 text-center text-xs text-gray-400">
        {totalTasks} task{totalTasks !== 1 ? 's' : ''} across {columns.length}{' '}
        column{columns.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default ListView;
