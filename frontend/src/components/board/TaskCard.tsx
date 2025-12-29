'use client';

import { forwardRef } from 'react';
import { Calendar, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from './Board';

// Label color configuration based on Figma design
const labelColors: Record<string, { bg: string; text: string }> = {
  // Green (UI/UX, etc.)
  green: { bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
  // Yellow (Design, etc.)
  yellow: { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]' },
  // Blue (High priority, etc.)
  blue: { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]' },
  // Purple (Wireframe, etc.)
  purple: { bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
  // Pink (Prototype, etc.)
  pink: { bg: 'bg-[#FDF2F8]', text: 'text-[#EC4899]' },
  // Gray (default)
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

// Helper to get closest label color based on hex value
function getLabelColor(hexColor: string): { bg: string; text: string } {
  const colorMap: Record<string, string> = {
    '#10B981': 'green',
    '#059669': 'green',
    '#F59E0B': 'yellow',
    '#D97706': 'yellow',
    '#3B82F6': 'blue',
    '#2563EB': 'blue',
    '#8B5CF6': 'purple',
    '#7C3AED': 'purple',
    '#EC4899': 'pink',
    '#DB2777': 'pink',
  };

  const normalizedHex = hexColor.toUpperCase();
  const colorKey = colorMap[normalizedHex] || 'gray';
  return labelColors[colorKey];
}

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
  isDragging?: boolean;
  isOverlay?: boolean;
  className?: string;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onClick, isDragging = false, isOverlay = false, className }, ref) => {
    const formattedDate = formatDate(task.dueDate);
    const hasLabels = task.labels && task.labels.length > 0;
    const hasAttachments = task._count?.attachments && task._count.attachments > 0;
    const hasAssignees = task.assignees && task.assignees.length > 0;
    const hasFooter = hasAttachments || hasAssignees;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-gray-200 rounded-[14px] p-[14px] cursor-pointer',
          'transition-all duration-200',
          'hover:border-gray-300 hover:shadow-sm',
          isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
          isOverlay && 'shadow-xl rotate-3',
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
        <div className="flex flex-col gap-[14px]">
          {/* Top Section: Date + Title + Description + Labels */}
          <div className="flex flex-col gap-3">
            {/* Due Date */}
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-[18px] text-gray-400" strokeWidth={1.5} />
                <span className="text-sm text-gray-500 leading-normal">
                  {formattedDate}
                </span>
              </div>
            )}

            {/* Title & Description */}
            <div className="flex flex-col gap-[7px]">
              <h4 className="text-[19px] font-semibold text-black leading-[24px]">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-500 leading-normal line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Labels */}
            {hasLabels && (
              <div className="flex flex-wrap items-center gap-2">
                {task.labels!.map((label) => {
                  const colors = getLabelColor(label.color);
                  return (
                    <span
                      key={label.id}
                      className={cn(
                        'px-2.5 py-1 rounded-[10px] text-xs leading-normal',
                        colors.bg,
                        colors.text
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
                {/* Attachments Count */}
                <div className="flex items-center gap-1.5">
                  {hasAttachments && (
                    <>
                      <Paperclip className="size-[19px] text-gray-400" strokeWidth={1.5} />
                      <span className="text-xs text-gray-500 leading-normal">
                        {task._count!.attachments} Files
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
