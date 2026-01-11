'use client';

import { forwardRef } from 'react';
import { Calendar, Paperclip, Circle, CheckCircle2 } from 'lucide-react';
import { cn, getDueDateColor } from '@/lib/utils';
import { getLabelStyles } from '@/components/labels';
import { PriorityBadge } from '@/components/task/PrioritySelector';
import { stripHtml } from '@/components/editor';
import type { Task } from './Board';

// Format date for display
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
  className?: string;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onClick, onToggleComplete, isDragging = false, isOverlay = false, className }, ref) => {
    const isCompleted = !!task.completedAt;
    const formattedDate = formatDate(task.dueDate);
    const hasLabels = task.labels && task.labels.length > 0;
    // Only show attachments if count is > 0 (never show "0 Files")
    const attachmentCount = task._count?.attachments ?? 0;
    const hasAttachments = attachmentCount > 0;
    const hasAssignees = task.assignees && task.assignees.length > 0;
    const hasFooter = hasAttachments || hasAssignees;

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-white border border-gray-200 rounded-[14px] p-[14px] cursor-pointer',
          'transition-all duration-200',
          'hover:border-gray-300 hover:shadow-sm',
          isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
          isOverlay && 'shadow-xl rotate-3',
          isCompleted && 'opacity-60',
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        data-task-id={task.id}
      >
        {/* Subtle Completion Checkbox - Top Right */}
        {onToggleComplete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id, !isCompleted);
            }}
            className={cn(
              'absolute top-3 right-3 z-10 transition-all duration-200',
              !isCompleted && 'opacity-0 group-hover:opacity-100'
            )}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="size-5 text-green-500" />
            ) : (
              <Circle className="size-5 text-gray-300 hover:text-gray-400" />
            )}
          </button>
        )}

        <div className="flex flex-col gap-[14px]">
          {/* Top Section: Date + Priority + Title + Description + Labels */}
          <div className="flex flex-col gap-3">
            {/* Due Date and Priority Row */}
            {(formattedDate || task.priority) && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Due Date with urgency colors */}
                {formattedDate && (
                  <div className={cn('flex items-center gap-1.5', getDueDateColor(task.dueDate))}>
                    <Calendar className="size-[18px]" strokeWidth={1.5} />
                    <span className="text-sm leading-normal">
                      {formattedDate}
                    </span>
                  </div>
                )}
                {/* Priority Badge */}
                {task.priority && (
                  <PriorityBadge priority={task.priority} size="sm" />
                )}
              </div>
            )}

            {/* Title & Description */}
            <div className="flex flex-col gap-[7px]">
                <h4 className={cn(
                "text-[19px] font-medium text-black leading-[24px] pr-6",
                isCompleted && "line-through text-gray-400"
              )}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-500 leading-normal line-clamp-2">
                  {stripHtml(task.description)}
                </p>
              )}
            </div>

            {/* Labels */}
            {hasLabels && (
              <div className="flex flex-wrap items-center gap-2">
                {task.labels!.map((label) => {
                  const styles = getLabelStyles(label.color);
                  return (
                    <span
                      key={label.id}
                      className={cn(
                        'px-2.5 py-1 rounded-[10px] text-xs font-normal leading-normal',
                        styles.bg,
                        styles.text
                      )}
                    >
                      {label.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: Attachments + Assignees */}
          {hasFooter && (
            <>
              {/* Separator Line */}
              <div className="h-px bg-gray-200 w-full" />

              <div className="flex items-center justify-between">
                {/* Attachments Count - only shown when > 0 */}
                <div className="flex items-center gap-1.5">
                  {hasAttachments && (
                    <>
                      <Paperclip className="size-[19px] text-gray-400" strokeWidth={1.5} />
                      <span className="text-xs text-gray-500 leading-normal">
                        {attachmentCount} {attachmentCount === 1 ? 'File' : 'Files'}
                      </span>
                    </>
                  )}
                </div>

                {/* Assignees Avatar Stack */}
                {hasAssignees && (
                  <div className="flex items-center">
                    {task.assignees!.slice(0, 4).map((assignee, index) => (
                      <div
                        key={assignee.id}
                        className={cn(
                          'relative size-[34px] rounded-full border-[1.2px] border-white overflow-hidden bg-gray-200',
                          index > 0 && '-ml-[17px]'
                        )}
                        style={{ zIndex: task.assignees!.length - index }}
                        title={assignee.name}
                      >
                        {assignee.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-xs font-medium text-gray-600 bg-gray-200">
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {task.assignees!.length > 4 && (
                      <div
                        className="relative size-[34px] rounded-full border-[1.2px] border-white bg-gray-100 -ml-[17px] flex items-center justify-center"
                        style={{ zIndex: 0 }}
                      >
                        <span className="text-xs font-medium text-gray-600">
                          +{task.assignees!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

TaskCard.displayName = 'TaskCard';

export default TaskCard;
