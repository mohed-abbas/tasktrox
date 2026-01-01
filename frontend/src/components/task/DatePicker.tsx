'use client';

import { useState, useCallback } from 'react';
import { format, isToday, isTomorrow, isPast, addDays, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Quick select options
const quickSelectOptions = [
  { label: 'Today', getValue: () => new Date() },
  { label: 'Tomorrow', getValue: () => addDays(new Date(), 1) },
  { label: 'Next Week', getValue: () => addDays(new Date(), 7) },
  { label: 'In 2 Weeks', getValue: () => addDays(new Date(), 14) },
];

// Date status helpers
function getDateStatus(date: Date | null): 'overdue' | 'due-soon' | 'normal' | null {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate < today) return 'overdue';

  const threeDaysFromNow = addDays(today, 3);
  if (isWithinInterval(compareDate, { start: today, end: threeDaysFromNow })) {
    return 'due-soon';
  }

  return 'normal';
}

// Format date for display
function formatDisplayDate(date: Date | null): string {
  if (!date) return 'Set due date';

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';

  return format(date, 'MMM d, yyyy');
}

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Set due date',
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange(date || null);
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  const handleQuickSelect = useCallback(
    (getValue: () => Date) => {
      const date = getValue();
      date.setHours(23, 59, 59, 999); // End of day
      onChange(date);
      setOpen(false);
    },
    [onChange]
  );

  const dateStatus = getDateStatus(value);
  const displayText = value ? formatDisplayDate(value) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !value && 'text-gray-400',
            dateStatus === 'overdue' && 'border-error text-error-dark bg-error-light hover:bg-error-light',
            dateStatus === 'due-soon' && 'border-warning text-warning-dark bg-warning-light hover:bg-warning-light',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1">{displayText}</span>
          {value && (
            <motion.span
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="ml-2 p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Quick Select Options */}
            <div className="border-b border-gray-100 p-2">
              <div className="grid grid-cols-2 gap-1">
                {quickSelectOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleQuickSelect(option.getValue)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md text-left',
                      'hover:bg-gray-100 transition-colors',
                      'text-gray-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleSelect}
              initialFocus
              disabled={(date) => {
                // Optionally disable past dates
                // return isPast(date) && !isToday(date);
                return false;
              }}
            />

            {/* Clear Button */}
            {value && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => handleSelect(undefined)}
                  className={cn(
                    'w-full px-3 py-1.5 text-sm rounded-md',
                    'text-gray-500 hover:bg-gray-100 transition-colors'
                  )}
                >
                  Remove due date
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
