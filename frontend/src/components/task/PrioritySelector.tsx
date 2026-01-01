'use client';

import { useState, useCallback } from 'react';
import { Flag, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Priority type
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | null;

// Priority configuration
const priorityConfig = {
  HIGH: {
    label: 'High',
    description: 'Urgent and important',
    bg: 'bg-priority-high-bg',
    text: 'text-priority-high-text',
    border: 'border-red-200',
    hoverBg: 'hover:bg-red-50',
    icon: '🔴',
  },
  MEDIUM: {
    label: 'Medium',
    description: 'Important but not urgent',
    bg: 'bg-priority-medium-bg',
    text: 'text-priority-medium-text',
    border: 'border-yellow-200',
    hoverBg: 'hover:bg-yellow-50',
    icon: '🟡',
  },
  LOW: {
    label: 'Low',
    description: 'Nice to have',
    bg: 'bg-priority-low-bg',
    text: 'text-priority-low-text',
    border: 'border-green-200',
    hoverBg: 'hover:bg-green-50',
    icon: '🟢',
  },
} as const;

const priorityOrder: ('HIGH' | 'MEDIUM' | 'LOW')[] = ['HIGH', 'MEDIUM', 'LOW'];

export interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function PrioritySelector({
  value,
  onChange,
  disabled = false,
  className,
  showLabel = true,
}: PrioritySelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (priority: Priority) => {
      onChange(priority);
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

  const currentConfig = value ? priorityConfig[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal h-9',
            !value && 'text-gray-400',
            value && currentConfig && [
              currentConfig.bg,
              currentConfig.text,
              currentConfig.border,
            ],
            className
          )}
        >
          <Flag className="mr-2 h-4 w-4" />
          <span className="flex-1">
            {value && currentConfig ? (
              showLabel ? `${currentConfig.label} Priority` : currentConfig.label
            ) : (
              'Set priority'
            )}
          </span>
          {value ? (
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
              className="ml-2 p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer"
              aria-label="Clear priority"
            >
              <X className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-0.5"
          >
            {priorityOrder.map((priority, index) => {
              const config = priorityConfig[priority];
              const isSelected = value === priority;

              return (
                <motion.button
                  key={priority}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelect(priority)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                    'transition-colors text-left',
                    config.hoverBg,
                    isSelected && config.bg
                  )}
                >
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      priority === 'HIGH' && 'bg-red-500',
                      priority === 'MEDIUM' && 'bg-yellow-500',
                      priority === 'LOW' && 'bg-green-500'
                    )}
                  />
                  <div className="flex-1">
                    <div className={cn('text-sm font-medium', config.text)}>
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.description}
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Check className={cn('h-4 w-4', config.text)} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}

            {/* No Priority Option */}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.09 }}
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                  'transition-colors text-left hover:bg-gray-50',
                  value === null && 'bg-gray-50'
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-600">
                    No Priority
                  </div>
                  <div className="text-xs text-gray-400">
                    Remove priority level
                  </div>
                </div>
                {value === null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Check className="h-4 w-4 text-gray-500" />
                  </motion.div>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

// Compact badge version for display in cards
export function PriorityBadge({
  priority,
  className,
  size = 'md',
}: {
  priority: Priority;
  className?: string;
  size?: 'sm' | 'md';
}) {
  if (!priority) return null;

  const config = priorityConfig[priority];

  const sizeClasses = {
    sm: 'gap-1 px-1.5 py-0.5 text-[10px]',
    md: 'gap-1.5 px-2 py-0.5 text-xs',
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium',
        sizeClasses[size],
        config.bg,
        config.text,
        className
      )}
    >
      <Flag className={iconSizes[size]} />
      {config.label}
    </span>
  );
}

export default PrioritySelector;
