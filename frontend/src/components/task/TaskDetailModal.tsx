'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DatePicker } from './DatePicker';
import { PrioritySelector, type Priority } from './PrioritySelector';
import { AssigneeSelector, AssigneeAvatarStack } from './AssigneeSelector';
import { SaveIndicator } from './SaveIndicator';
import { LabelSelector, LabelBadge } from '@/components/labels';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAssignees } from '@/hooks/useAssignees';
import type { Task } from '@/lib/api/tasks';
import type { Label } from '@/lib/api/labels';

/** Shape of editable task data for auto-save */
interface EditableTaskData {
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
}

// Animation variants for modal
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

// Content stagger animation
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (taskId: string, data: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  isLoading?: boolean;
  // Label props
  projectLabels?: Label[];
  onLabelsChange?: (taskId: string, labelIds: string[]) => void;
  onCreateLabel?: (name: string, color: string) => Promise<Label>;
  // Project context for assignees
  projectId?: string;
  /** When true, disables all editing (for VIEWER role) */
  readOnly?: boolean;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  isLoading = false,
  projectLabels = [],
  onLabelsChange,
  onCreateLabel,
  projectId,
  readOnly = false,
}: TaskDetailModalProps) {
  // Local state for editing
  const [editableData, setEditableData] = useState<EditableTaskData>({
    title: task?.title ?? '',
    description: task?.description ?? null,
    priority: (task?.priority as Priority) ?? null,
    dueDate: task?.dueDate ?? null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Assignees hook - only enabled when we have projectId and taskId
  const {
    assignees,
    members,
    addAssignee,
    removeAssignee,
    isLoading: isAssigneesLoading,
    isMembersLoading,
    isMutating: isAssigneeMutating,
  } = useAssignees({
    projectId: projectId || '',
    taskId: task?.id,
    enabled: open && !!projectId && !!task?.id,
  });

  // Original data for comparison (memoized to avoid unnecessary re-renders)
  const originalData = useMemo<EditableTaskData>(
    () => ({
      title: task?.title ?? '',
      description: task?.description ?? null,
      priority: (task?.priority as Priority) ?? null,
      dueDate: task?.dueDate ?? null,
    }),
    [task?.title, task?.description, task?.priority, task?.dueDate]
  );

  // Auto-save hook
  const { status: saveStatus, error: saveError } = useAutoSave({
    value: editableData,
    originalValue: originalData,
    onSave: async (data) => {
      if (!task || !onUpdate) return;

      // Only send changed fields
      const changes: Partial<Task> = {};

      if (data.title.trim() && data.title !== originalData.title) {
        changes.title = data.title.trim();
      }
      if (data.description !== originalData.description) {
        changes.description = data.description;
      }
      if (data.priority !== originalData.priority) {
        changes.priority = data.priority;
      }
      if (data.dueDate !== originalData.dueDate) {
        changes.dueDate = data.dueDate;
      }

      if (Object.keys(changes).length > 0) {
        await onUpdate(task.id, changes);
      }
    },
    debounceMs: 500,
    savedDurationMs: 2000,
    enabled: open && !!task,
  });

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setEditableData({
        title: task.title ?? '',
        description: task.description ?? null,
        priority: (task.priority as Priority) ?? null,
        dueDate: task.dueDate ?? null,
      });
    }
  }, [task]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  // Update handlers - now just update local state, auto-save handles the rest
  const handleTitleChange = useCallback((value: string) => {
    setEditableData((prev) => ({ ...prev, title: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setEditableData((prev) => ({ ...prev, description: value || null }));
  }, []);

  const handlePriorityChange = useCallback((priority: Priority) => {
    setEditableData((prev) => ({ ...prev, priority }));
  }, []);

  const handleDueDateChange = useCallback((date: Date | null) => {
    setEditableData((prev) => ({
      ...prev,
      dueDate: date?.toISOString() ?? null,
    }));
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await onDelete?.(task.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle key down for title
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      // Reset to original value
      setEditableData((prev) => ({ ...prev, title: task?.title ?? '' }));
      (e.target as HTMLInputElement).blur();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  // Parse due date from editable data
  const dueDate = editableData.dueDate ? new Date(editableData.dueDate) : null;

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className={cn(
              'fixed left-[50%] top-[50%] z-50 w-full max-w-2xl max-h-[90vh]',
              'bg-white rounded-xl shadow-modal border border-gray-200',
              'overflow-hidden',
              'focus:outline-none'
            )}
            style={{ x: '-50%', y: '-50%' }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="size-8 text-gray-400 animate-spin" />
                </motion.div>
              </div>
            ) : task ? (
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="overflow-y-auto max-h-[90vh]"
              >
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-start justify-between p-6 pb-0 sticky top-0 bg-white z-10"
                >
                  <div className="flex-1 pr-4">
                    {/* Editable Title */}
                    <input
                      id="task-modal-title"
                      type="text"
                      value={editableData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      disabled={readOnly}
                      className={cn(
                        'w-full text-xl font-semibold text-gray-900',
                        'bg-transparent border-0 outline-none',
                        'focus:ring-0 p-0',
                        'placeholder:text-gray-400',
                        readOnly && 'cursor-default'
                      )}
                      placeholder="Task title..."
                      autoFocus={!readOnly}
                    />
                  </div>

                  {/* Save Indicator + Actions */}
                  <div className="flex items-center gap-2">
                    {!readOnly && <SaveIndicator status={saveStatus} error={saveError} />}
                    {!readOnly && onDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              'p-2 rounded-lg text-gray-400',
                              'hover:bg-gray-100 hover:text-gray-600',
                              'transition-colors'
                            )}
                          >
                            <MoreHorizontal className="size-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            <Trash2 className="size-4 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete Task'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <button
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        'p-2 rounded-lg text-gray-400',
                        'hover:bg-gray-100 hover:text-gray-600',
                        'transition-colors'
                      )}
                      aria-label="Close"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Properties Row: Priority + Due Date */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    {/* Priority Selector */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <PrioritySelector
                        value={editableData.priority}
                        onChange={handlePriorityChange}
                        showLabel={false}
                        className="w-full"
                        disabled={readOnly}
                      />
                    </div>

                    {/* Due Date Picker */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <DatePicker
                        value={dueDate}
                        onChange={handleDueDateChange}
                        className="w-full"
                        disabled={readOnly}
                      />
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={editableData.description || ''}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder={readOnly ? 'No description' : 'Add a description...'}
                      rows={4}
                      disabled={readOnly}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border border-gray-200',
                        'text-sm text-gray-700 placeholder:text-gray-400',
                        'focus:border-gray-400 focus:ring-2 focus:ring-gray-800/10',
                        'outline-none transition-colors resize-none',
                        readOnly && 'bg-gray-50 cursor-default'
                      )}
                    />
                  </motion.div>

                  {/* Labels Section */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Labels
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Display selected labels */}
                      {task.labels && task.labels.map((label, index) => (
                        <motion.div
                          key={label.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <LabelBadge
                            label={label}
                            onRemove={
                              onLabelsChange
                                ? () => {
                                    const newLabelIds = (task.labels || [])
                                      .filter((l) => l.id !== label.id)
                                      .map((l) => l.id);
                                    onLabelsChange(task.id, newLabelIds);
                                  }
                                : undefined
                            }
                          />
                        </motion.div>
                      ))}

                      {/* Label selector - only show when can edit */}
                      {onLabelsChange && (
                        <LabelSelector
                          projectLabels={projectLabels}
                          selectedLabelIds={(task.labels || []).map((l) => l.id)}
                          onSelect={(labelIds) => onLabelsChange(task.id, labelIds)}
                          onCreateLabel={onCreateLabel}
                          className="border-dashed"
                        />
                      )}

                      {/* Show message when no labels and read-only */}
                      {readOnly && (!task.labels || task.labels.length === 0) && (
                        <span className="text-sm text-gray-400">No labels</span>
                      )}
                    </div>
                  </motion.div>

                  {/* Assignees Section */}
                  {projectId && (
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Assignees
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Display current assignees as avatars */}
                        {assignees.length > 0 && (
                          <AssigneeAvatarStack
                            assignees={assignees}
                            max={5}
                            size="md"
                            onRemove={readOnly ? undefined : removeAssignee}
                          />
                        )}

                        {/* Assignee selector to add/remove - hide when read-only */}
                        {!readOnly && (
                          <AssigneeSelector
                            assignees={assignees}
                            members={members}
                            onAdd={addAssignee}
                            onRemove={removeAssignee}
                            disabled={isAssigneeMutating}
                            isLoading={isAssigneesLoading || isMembersLoading}
                            className="border-dashed"
                          />
                        )}

                        {/* Show message when no assignees and read-only */}
                        {readOnly && assignees.length === 0 && (
                          <span className="text-sm text-gray-400">No assignees</span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Metadata Footer */}
                  <motion.div
                    variants={itemVariants}
                    className="pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        Created{' '}
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>
                        Updated{' '}
                        {new Date(task.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-16 text-gray-500"
              >
                Task not found
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TaskDetailModal;
