'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, MoreHorizontal, Trash2, Loader2, Circle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from './DatePicker';
import { PrioritySelector, type Priority } from './PrioritySelector';
import { AssigneeSelector, AssigneeAvatarStack } from './AssigneeSelector';
import { LabelSelector, LabelBadge } from '@/components/labels';
import { useAssignees } from '@/hooks/useAssignees';
import { useAttachments } from '@/hooks/useAttachments';
import { usePresence } from '@/hooks/usePresence';
import { PresenceIndicator } from '@/components/presence/PresenceIndicator';
import { CommentSection } from '@/components/comment';
import { AttachmentUploader, AttachmentList } from '@/components/attachment';
import { RichTextEditor } from '@/components/editor';
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
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
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
  onToggleComplete?: (taskId: string, completed: boolean) => void;
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
  onToggleComplete,
  isLoading = false,
  projectLabels = [],
  onLabelsChange,
  onCreateLabel,
  projectId,
  readOnly = false,
}: TaskDetailModalProps) {
  const isCompleted = !!task?.completedAt;
  // Local state for editing
  const [editableData, setEditableData] = useState<EditableTaskData>({
    title: task?.title ?? '',
    description: task?.description ?? null,
    priority: (task?.priority as Priority) ?? null,
    dueDate: task?.dueDate ?? null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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

  // Attachments hook
  const {
    attachments,
    isLoading: isAttachmentsLoading,
    uploadAsync,
    isUploading,
    uploadError,
    deleteAttachment,
    deletingId,
  } = useAttachments({
    projectId: projectId || '',
    taskId: task?.id || '',
    enabled: open && !!projectId && !!task?.id,
  });

  // Wrapper for upload to handle the async properly
  const handleUploadAttachment = useCallback(async (file: File) => {
    await uploadAsync(file);
  }, [uploadAsync]);

  // Presence hooks for real-time editing indicators
  const titlePresence = usePresence({
    projectId: projectId || '',
    taskId: task?.id || '',
    field: 'title',
    enabled: open && !!projectId && !!task?.id && !readOnly,
  });

  const descriptionPresence = usePresence({
    projectId: projectId || '',
    taskId: task?.id || '',
    field: 'description',
    enabled: open && !!projectId && !!task?.id && !readOnly,
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

  // Change detection - enables/disables save button
  const hasChanges = useMemo(() => {
    return (
      editableData.title !== originalData.title ||
      editableData.description !== originalData.description ||
      editableData.priority !== originalData.priority ||
      editableData.dueDate !== originalData.dueDate
    );
  }, [editableData, originalData]);

  // Validation - title is required
  const isValid = editableData.title.trim().length > 0;

  // Handle attempt to close - check for unsaved changes (defined early for useEffect)
  const handleAttemptClose = useCallback(() => {
    if (hasChanges && !readOnly) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(false);
    }
  }, [hasChanges, readOnly, onOpenChange]);

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
        // Check for unsaved changes before closing
        handleAttemptClose();
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
  }, [open, handleAttemptClose]);

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

  // Handle save - validates and submits changes
  const handleSave = useCallback(async () => {
    if (!task || !onUpdate || !isValid || !hasChanges) return;

    setIsSaving(true);
    try {
      // Build delta object with only changed fields
      const changes: Partial<Task> = {};

      if (editableData.title.trim() !== originalData.title) {
        changes.title = editableData.title.trim();
      }
      if (editableData.description !== originalData.description) {
        changes.description = editableData.description;
      }
      if (editableData.priority !== originalData.priority) {
        changes.priority = editableData.priority;
      }
      if (editableData.dueDate !== originalData.dueDate) {
        changes.dueDate = editableData.dueDate;
      }

      if (Object.keys(changes).length > 0) {
        await onUpdate(task.id, changes);
      }

      // Close modal on successful save
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }, [task, onUpdate, isValid, hasChanges, editableData, originalData, onOpenChange]);

  // Handle cancel - discard changes and close
  const handleCancel = useCallback(() => {
    // Reset to original values
    if (task) {
      setEditableData({
        title: task.title ?? '',
        description: task.description ?? null,
        priority: (task.priority as Priority) ?? null,
        dueDate: task.dueDate ?? null,
      });
    }
    onOpenChange(false);
  }, [task, onOpenChange]);

  // Handle confirm discard
  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    // Reset to original values and close
    if (task) {
      setEditableData({
        title: task.title ?? '',
        description: task.description ?? null,
        priority: (task.priority as Priority) ?? null,
        dueDate: task.dueDate ?? null,
      });
    }
    onOpenChange(false);
  }, [task, onOpenChange]);

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
      handleAttemptClose();
    }
  };

  // Parse due date from editable data
  const dueDate = editableData.dueDate ? new Date(editableData.dueDate) : null;

  return (
    <>
    <AnimatePresence mode="wait">
      {open && (
        /* Backdrop with flexbox centering */
        <motion.div
            key="task-detail-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          >
            {/* Modal */}
            <motion.div
              className={cn(
                'w-full max-w-2xl max-h-[90vh]',
                'bg-white rounded-xl shadow-modal border border-gray-200',
                'flex flex-col overflow-hidden',
                'focus:outline-none'
              )}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-modal-title"
              onClick={(e) => e.stopPropagation()}
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
              <>
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto"
              >
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-start justify-between p-6 pb-0 sticky top-0 bg-white z-10"
                >
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    {/* Completion Toggle */}
                    {onToggleComplete && !readOnly ? (
                      <button
                        onClick={() => onToggleComplete(task.id, !isCompleted)}
                        className="flex-shrink-0 mt-1 transition-colors"
                        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-6 text-green-500" />
                        ) : (
                          <Circle className="size-6 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle2 className="size-6 text-green-500" />
                        ) : (
                          <Circle className="size-6 text-gray-300" />
                        )}
                      </div>
                    )}

                    {/* Editable Title with Presence */}
                    <div className="relative flex-1">
                      <input
                        id="task-modal-title"
                        type="text"
                        value={editableData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onFocus={titlePresence.startEditing}
                        onBlur={() => {
                          // Stop presence tracking
                          titlePresence.stopEditing();
                        }}
                        disabled={readOnly}
                        className={cn(
                          'w-full text-xl font-semibold text-gray-900',
                          'bg-transparent border-0 outline-none',
                          'focus:ring-0 p-0 pr-8',
                          'placeholder:text-gray-400',
                          readOnly && 'cursor-default',
                          isCompleted && 'line-through text-gray-400'
                        )}
                        placeholder="Task title..."
                        autoFocus={!readOnly}
                      />
                      {/* Presence indicator for title */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <PresenceIndicator
                          user={titlePresence.editingUser ? {
                            id: titlePresence.editingUser.id,
                            name: titlePresence.editingUser.name,
                            avatar: titlePresence.editingUser.avatar ?? null,
                          } : null}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
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
                      onClick={handleAttemptClose}
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
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      {/* Presence indicator for description */}
                      <PresenceIndicator
                        user={descriptionPresence.editingUser ? {
                          id: descriptionPresence.editingUser.id,
                          name: descriptionPresence.editingUser.name,
                          avatar: descriptionPresence.editingUser.avatar ?? null,
                        } : null}
                        size="sm"
                      />
                    </div>
                    {readOnly ? (
                      <div
                        className={cn(
                          'w-full px-3 py-2 rounded-lg border border-gray-200',
                          'text-sm text-gray-700 min-h-[100px] bg-gray-50'
                        )}
                      >
                        {editableData.description ? (
                          <div
                            className="prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0"
                            dangerouslySetInnerHTML={{ __html: editableData.description }}
                          />
                        ) : (
                          <span className="text-gray-400">No description</span>
                        )}
                      </div>
                    ) : (
                      <RichTextEditor
                        value={editableData.description}
                        onChange={handleDescriptionChange}
                        onFocus={descriptionPresence.startEditing}
                        onBlur={descriptionPresence.stopEditing}
                        placeholder="Add a description..."
                      />
                    )}
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

                  {/* Attachments Section */}
                  {projectId && task && (
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Attachments
                      </label>

                      {/* Attachment uploader - hide when read-only */}
                      {!readOnly && (
                        <AttachmentUploader
                          onUpload={handleUploadAttachment}
                          isUploading={isUploading}
                          error={uploadError}
                          maxSizeMB={10}
                        />
                      )}

                      {/* Attachment list */}
                      <AttachmentList
                        attachments={attachments}
                        isLoading={isAttachmentsLoading}
                        onDelete={readOnly ? undefined : deleteAttachment}
                        deletingId={deletingId}
                      />
                    </motion.div>
                  )}

                  {/* Comments Section */}
                  {projectId && task && (
                    <motion.div variants={itemVariants} className="pt-4 border-t border-gray-100">
                      <CommentSection
                        projectId={projectId}
                        taskId={task.id}
                      />
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

              {/* Sticky Footer - Save/Cancel buttons always visible */}
              {!readOnly && onUpdate && (
                <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || !isValid || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              )}
              </>
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
          </motion.div>
      )}
    </AnimatePresence>

    {/* Discard Changes Confirmation Dialog - outside AnimatePresence (has own animation) */}
    <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to discard them? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Editing</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDiscard}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

export default TaskDetailModal;
