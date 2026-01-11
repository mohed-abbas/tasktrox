import type { EventInput } from '@fullcalendar/core';
import type { Task, ColumnWithTasks } from '@/components/board';

/**
 * Priority color configuration for calendar events
 */
export const priorityColors = {
  HIGH: {
    borderColor: '#ef4444', // red-500
    backgroundColor: '#fef2f2', // red-50
  },
  MEDIUM: {
    borderColor: '#f59e0b', // amber-500
    backgroundColor: '#fffbeb', // amber-50
  },
  LOW: {
    borderColor: '#22c55e', // green-500
    backgroundColor: '#f0fdf4', // green-50
  },
  default: {
    borderColor: '#d1d5db', // gray-300
    backgroundColor: '#ffffff',
  },
} as const;

/**
 * Extended event properties for task data
 */
export interface CalendarEventExtendedProps {
  task: Task;
  columnName: string;
  columnColor: string | null;
  priority: Task['priority'];
  isCompleted: boolean;
}

/**
 * Transform columns with tasks into FullCalendar events.
 * Only tasks with due dates are included.
 */
export function tasksToCalendarEvents(
  columns: ColumnWithTasks[]
): EventInput[] {
  const events: EventInput[] = [];

  for (const column of columns) {
    for (const task of column.tasks) {
      // Only include tasks that have a due date
      if (task.dueDate) {
        const isCompleted = !!task.completedAt;
        const colors = task.priority
          ? priorityColors[task.priority]
          : priorityColors.default;

        events.push({
          id: task.id,
          title: task.title,
          start: task.dueDate,
          allDay: true,
          borderColor: isCompleted ? '#9ca3af' : colors.borderColor, // gray-400 if completed
          backgroundColor: isCompleted ? '#f3f4f6' : colors.backgroundColor, // gray-100 if completed
          textColor: isCompleted ? '#9ca3af' : '#374151', // gray-400 or gray-700
          classNames: [
            'calendar-event',
            isCompleted ? 'calendar-event--completed' : '',
            task.priority ? `calendar-event--${task.priority.toLowerCase()}` : '',
          ].filter(Boolean),
          extendedProps: {
            task,
            columnName: column.name,
            columnColor: column.color,
            priority: task.priority,
            isCompleted,
          } satisfies CalendarEventExtendedProps,
        });
      }
    }
  }

  return events;
}

/**
 * Count tasks without due dates for display purposes
 */
export function countUnscheduledTasks(columns: ColumnWithTasks[]): number {
  let count = 0;
  for (const column of columns) {
    for (const task of column.tasks) {
      if (!task.dueDate) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Get total task count across all columns
 */
export function getTotalTaskCount(columns: ColumnWithTasks[]): number {
  return columns.reduce((sum, col) => sum + col.tasks.length, 0);
}
