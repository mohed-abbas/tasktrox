'use client';

import type { EventContentArg } from '@fullcalendar/core';
import { cn } from '@/lib/utils';
import type { CalendarEventExtendedProps } from '@/lib/calendar-utils';

interface CalendarEventContentProps {
  eventInfo: EventContentArg;
}

/**
 * Custom event content renderer for calendar events.
 * Displays task title with priority indicator and completion status.
 */
export function CalendarEventContent({ eventInfo }: CalendarEventContentProps) {
  const extendedProps = eventInfo.event.extendedProps as CalendarEventExtendedProps;
  const { isCompleted, columnName } = extendedProps;

  return (
    <div
      className={cn(
        'px-1.5 py-0.5 text-[11px] leading-tight truncate w-full',
        'rounded-[3px] border-l-[3px]',
        isCompleted && 'line-through opacity-60'
      )}
      style={{
        borderLeftColor: eventInfo.event.borderColor || '#d1d5db',
        backgroundColor: eventInfo.event.backgroundColor || '#ffffff',
        color: eventInfo.event.textColor || '#374151',
      }}
      title={`${eventInfo.event.title} (${columnName})`}
    >
      <span className="font-medium">{eventInfo.event.title}</span>
    </div>
  );
}

export default CalendarEventContent;
