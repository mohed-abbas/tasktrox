'use client';

import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@/lib/api/activities';
import type { ReactNode } from 'react';
import {
  CheckCircle2,
  Circle,
  Columns3,
  Edit3,
  MessageSquare,
  Move,
  Paperclip,
  Tag,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react';

export interface ActivityItemProps {
  activity: Activity;
  className?: string;
  showTask?: boolean;
}

/**
 * Get activity action details including icon and description.
 */
function getActivityDetails(activity: Activity): {
  icon: ReactNode;
  description: string;
  color: string;
} {
  const metadata = activity.metadata || {};
  const userName = activity.user.name;

  switch (activity.action) {
    // Task actions
    case 'task.created':
      return {
        icon: <Circle className="w-4 h-4" />,
        description: `${userName} created task "${metadata.taskTitle || 'Untitled'}"`,
        color: 'text-success',
      };
    case 'task.updated':
      return {
        icon: <Edit3 className="w-4 h-4" />,
        description: `${userName} updated task "${metadata.taskTitle || 'Untitled'}"`,
        color: 'text-info',
      };
    case 'task.deleted':
      return {
        icon: <Trash2 className="w-4 h-4" />,
        description: `${userName} deleted task "${metadata.taskTitle || 'Untitled'}"`,
        color: 'text-error',
      };
    case 'task.moved':
      return {
        icon: <Move className="w-4 h-4" />,
        description: `${userName} moved "${metadata.taskTitle}" from ${metadata.fromColumn} to ${metadata.toColumn}`,
        color: 'text-info',
      };
    case 'task.reordered':
      return {
        icon: <Move className="w-4 h-4" />,
        description: `${userName} reordered "${metadata.taskTitle}" in ${metadata.columnName}`,
        color: 'text-gray-500',
      };

    // Column actions
    case 'column.created':
      return {
        icon: <Columns3 className="w-4 h-4" />,
        description: `${userName} created column "${metadata.columnName}"`,
        color: 'text-success',
      };
    case 'column.updated':
      return {
        icon: <Edit3 className="w-4 h-4" />,
        description: `${userName} updated column "${metadata.columnName}"`,
        color: 'text-info',
      };
    case 'column.deleted':
      return {
        icon: <Trash2 className="w-4 h-4" />,
        description: `${userName} deleted column "${metadata.columnName}"`,
        color: 'text-error',
      };
    case 'column.reordered':
      return {
        icon: <Move className="w-4 h-4" />,
        description: `${userName} reordered column "${metadata.columnName}"`,
        color: 'text-gray-500',
      };

    // Label actions
    case 'label.created':
      return {
        icon: <Tag className="w-4 h-4" />,
        description: `${userName} created label "${metadata.labelName}"`,
        color: 'text-success',
      };
    case 'label.updated':
      return {
        icon: <Edit3 className="w-4 h-4" />,
        description: `${userName} updated label "${metadata.labelName}"`,
        color: 'text-info',
      };
    case 'label.deleted':
      return {
        icon: <Trash2 className="w-4 h-4" />,
        description: `${userName} deleted label "${metadata.labelName}"`,
        color: 'text-error',
      };
    case 'label.added':
      return {
        icon: <Tag className="w-4 h-4" />,
        description: `${userName} added label "${metadata.labelName}" to task`,
        color: 'text-success',
      };
    case 'label.removed':
      return {
        icon: <Tag className="w-4 h-4" />,
        description: `${userName} removed label "${metadata.labelName}" from task`,
        color: 'text-warning',
      };

    // Assignee actions
    case 'assignee.added':
      return {
        icon: <UserPlus className="w-4 h-4" />,
        description: `${userName} assigned someone to task`,
        color: 'text-success',
      };
    case 'assignee.removed':
      return {
        icon: <UserMinus className="w-4 h-4" />,
        description: `${userName} unassigned someone from task`,
        color: 'text-warning',
      };

    // Comment actions
    case 'comment.created':
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        description: `${userName} commented on task`,
        color: 'text-info',
      };
    case 'comment.updated':
      return {
        icon: <Edit3 className="w-4 h-4" />,
        description: `${userName} edited a comment`,
        color: 'text-info',
      };
    case 'comment.deleted':
      return {
        icon: <Trash2 className="w-4 h-4" />,
        description: `${userName} deleted a comment`,
        color: 'text-error',
      };

    // Attachment actions
    case 'attachment.uploaded':
      return {
        icon: <Paperclip className="w-4 h-4" />,
        description: `${userName} uploaded file "${metadata.attachmentName}"`,
        color: 'text-success',
      };
    case 'attachment.deleted':
      return {
        icon: <Trash2 className="w-4 h-4" />,
        description: `${userName} deleted file "${metadata.attachmentName}"`,
        color: 'text-error',
      };

    default:
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        description: `${userName} performed an action`,
        color: 'text-gray-500',
      };
  }
}

/**
 * ActivityItem - Renders a single activity entry.
 *
 * Shows the user avatar, action icon, description, and timestamp.
 */
export function ActivityItem({ activity, className, showTask = false }: ActivityItemProps) {
  const { icon, description, color } = getActivityDetails(activity);
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
  const initials = activity.user.name.charAt(0).toUpperCase();

  return (
    <div className={cn('flex items-start gap-3 py-3 group', className)}>
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden">
          {activity.user.avatar ? (
            <img
              src={activity.user.avatar}
              alt={activity.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(color)}>{icon}</span>
          <p className="text-sm text-gray-700 truncate">{description}</p>
        </div>

        {/* Task link if showing task */}
        {showTask && activity.task && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            in {activity.task.title}
          </p>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}

export default ActivityItem;
