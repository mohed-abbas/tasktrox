'use client';

import { formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { UpcomingTask } from '@/lib/api/stats';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UpcomingTasksProps {
  tasks: UpcomingTask[];
  isLoading?: boolean;
  className?: string;
}

function getPriorityColor(priority: string | null): string {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function formatDueDate(dateStr: string): { text: string; isUrgent: boolean } {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return { text: 'Due today', isUrgent: true };
  }
  if (isTomorrow(date)) {
    return { text: 'Due tomorrow', isUrgent: false };
  }

  return {
    text: `Due ${formatDistanceToNow(date, { addSuffix: true })}`,
    isUrgent: false,
  };
}

export function UpcomingTasks({ tasks, isLoading, className }: UpcomingTasksProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No upcoming tasks</p>
            <p className="text-xs">Tasks due within 7 days will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const { text: dueText, isUrgent } = formatDueDate(task.dueDate);

              return (
                <Link
                  key={task.id}
                  href={`/projects/${task.projectId}`}
                  className="block p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="truncate">{task.projectName}</span>
                        <span>•</span>
                        <span className="truncate">{task.columnName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {task.priority && (
                        <Badge
                          variant="outline"
                          className={cn('text-xs capitalize', getPriorityColor(task.priority))}
                        >
                          {task.priority}
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'text-xs flex items-center gap-1',
                          isUrgent ? 'text-red-600 font-medium' : 'text-muted-foreground'
                        )}
                      >
                        {isUrgent && <AlertTriangle className="h-3 w-3" />}
                        {dueText}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UpcomingTasks;
