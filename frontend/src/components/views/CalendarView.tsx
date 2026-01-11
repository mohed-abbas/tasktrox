'use client';

import { useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import { CalendarDays, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  tasksToCalendarEvents,
  countUnscheduledTasks,
  getTotalTaskCount,
} from '@/lib/calendar-utils';
import { CalendarEventContent } from './CalendarEventContent';
import type { Task, ColumnWithTasks } from '@/components/board';

export interface CalendarViewProps {
  columns: ColumnWithTasks[];
  projectId: string;
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
  onDueDateChange?: (taskId: string, newDate: string | null) => Promise<void>;
}

/**
 * Calendar view for displaying tasks by due date.
 * Supports month and week views with drag-drop rescheduling.
 */
export function CalendarView({
  columns,
  projectId: _projectId,
  isLoading = false,
  onTaskClick,
  onDueDateChange,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Transform tasks to calendar events
  const events = useMemo(
    () => tasksToCalendarEvents(columns),
    [columns]
  );

  const totalTasks = useMemo(() => getTotalTaskCount(columns), [columns]);
  const unscheduledCount = useMemo(() => countUnscheduledTasks(columns), [columns]);
  const scheduledCount = totalTasks - unscheduledCount;

  // Handle event click to open task detail
  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const task = info.event.extendedProps.task as Task;
      onTaskClick?.(task);
    },
    [onTaskClick]
  );

  // Handle event drop (drag to reschedule)
  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      if (!onDueDateChange) {
        info.revert();
        return;
      }

      const taskId = info.event.id;
      const newDate = info.event.start;

      if (!newDate) {
        info.revert();
        return;
      }

      try {
        await onDueDateChange(taskId, newDate.toISOString());
        toast.success('Due date updated');
      } catch {
        info.revert();
        toast.error('Failed to update due date');
      }
    },
    [onDueDateChange]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        {/* Calendar skeleton */}
        <div className="h-[600px] bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // Empty state
  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Clock className="size-12 mb-4 opacity-50" />
        <p className="text-sm">No columns yet</p>
        <p className="text-xs mt-1">Create a column and add tasks to get started</p>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {scheduledCount} scheduled task{scheduledCount !== 1 ? 's' : ''}
          </span>
          {unscheduledCount > 0 && (
            <span className="text-gray-400">
              ({unscheduledCount} without due date)
            </span>
          )}
        </div>
      </div>

      {/* FullCalendar */}
      <div className="calendar-container bg-white rounded-xl border border-gray-200 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          buttonText={{
            today: 'Today',
          }}
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          editable={!!onDueDateChange}
          droppable={false}
          dayMaxEvents={4}
          moreLinkClick="popover"
          eventContent={(eventInfo) => (
            <CalendarEventContent eventInfo={eventInfo} />
          )}
          height="auto"
          aspectRatio={1.8}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          navLinks={false}
          weekNumbers={false}
          eventDisplay="block"
          displayEventTime={false}
          eventInteractive={true}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-[3px] border-red-500 bg-red-50" />
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-[3px] border-amber-500 bg-amber-50" />
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-[3px] border-green-500 bg-green-50" />
          <span>Low Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-l-[3px] border-gray-300 bg-white" />
          <span>No Priority</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
