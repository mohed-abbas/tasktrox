'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Circle,
  Edit2,
  ArrowRight,
  Trash2,
  Tag,
  UserPlus,
  MessageSquare,
  Paperclip,
  Activity,
} from 'lucide-react';
import type { RecentActivityItem } from '@/lib/api/stats';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  activities: RecentActivityItem[];
  isLoading?: boolean;
  className?: string;
}

function getActivityIcon(action: string): ReactNode {
  const iconClass = 'h-4 w-4';

  if (action.includes('created')) {
    return <Circle className={cn(iconClass, 'text-green-500')} />;
  }
  if (action.includes('completed') || action.includes('done')) {
    return <CheckCircle2 className={cn(iconClass, 'text-green-500')} />;
  }
  if (action.includes('updated')) {
    return <Edit2 className={cn(iconClass, 'text-blue-500')} />;
  }
  if (action.includes('moved')) {
    return <ArrowRight className={cn(iconClass, 'text-purple-500')} />;
  }
  if (action.includes('deleted')) {
    return <Trash2 className={cn(iconClass, 'text-red-500')} />;
  }
  if (action.includes('label')) {
    return <Tag className={cn(iconClass, 'text-yellow-500')} />;
  }
  if (action.includes('assignee') || action.includes('member')) {
    return <UserPlus className={cn(iconClass, 'text-indigo-500')} />;
  }
  if (action.includes('comment')) {
    return <MessageSquare className={cn(iconClass, 'text-cyan-500')} />;
  }
  if (action.includes('attachment')) {
    return <Paperclip className={cn(iconClass, 'text-orange-500')} />;
  }

  return <Activity className={cn(iconClass, 'text-gray-500')} />;
}

function formatAction(action: string, metadata: Record<string, unknown> | null): string {
  // Extract entity type and action from format "entity.action"
  const [entity, act] = action.split('.');
  const taskTitle = metadata?.taskTitle as string | undefined;
  const title = taskTitle ? `"${taskTitle}"` : 'a task';

  switch (action) {
    case 'task.created':
      return `Created ${title}`;
    case 'task.updated':
      return `Updated ${title}`;
    case 'task.deleted':
      return `Deleted ${title}`;
    case 'task.moved':
      return `Moved ${title}`;
    case 'task.completed':
      return `Completed ${title}`;
    case 'column.created':
      return `Created column "${metadata?.columnName || 'New'}"`;
    case 'column.updated':
      return `Updated column "${metadata?.columnName || ''}"`;
    case 'column.deleted':
      return `Deleted a column`;
    case 'label.added':
      return `Added label to ${title}`;
    case 'label.removed':
      return `Removed label from ${title}`;
    case 'assignee.added':
      return `Assigned user to ${title}`;
    case 'assignee.removed':
      return `Unassigned user from ${title}`;
    case 'comment.created':
      return `Commented on ${title}`;
    case 'comment.updated':
      return `Updated comment on ${title}`;
    case 'comment.deleted':
      return `Deleted comment from ${title}`;
    case 'attachment.uploaded':
      return `Uploaded file to ${title}`;
    case 'attachment.deleted':
      return `Deleted file from ${title}`;
    default:
      return `${act || 'Updated'} ${entity || 'item'}`;
  }
}

export function RecentActivity({ activities, isLoading, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-4 w-4 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5">{getActivityIcon(activity.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {formatAction(activity.action, activity.metadata)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="truncate">{activity.projectName}</span>
                    <span>•</span>
                    <span className="flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;
