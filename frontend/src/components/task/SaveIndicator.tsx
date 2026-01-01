'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveStatus } from '@/hooks/useAutoSave';

interface SaveIndicatorProps {
  status: SaveStatus;
  error?: string | null;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<
  SaveStatus,
  {
    icon: typeof Check;
    label: string;
    className: string;
    animate?: boolean;
  }
> = {
  idle: {
    icon: Cloud,
    label: '',
    className: 'text-gray-300',
    animate: false,
  },
  pending: {
    icon: Cloud,
    label: 'Unsaved',
    className: 'text-amber-400',
    animate: false,
  },
  saving: {
    icon: Loader2,
    label: 'Saving...',
    className: 'text-gray-400',
    animate: true,
  },
  saved: {
    icon: Check,
    label: 'Saved',
    className: 'text-green-500',
    animate: false,
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    className: 'text-red-500',
    animate: false,
  },
};

/**
 * Visual indicator for auto-save status.
 * Shows different icons and labels based on save state.
 */
export function SaveIndicator({
  status,
  error,
  className,
  showLabel = true,
}: SaveIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Don't show anything when idle
  if (status === 'idle') {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'flex items-center gap-1.5',
          config.className,
          className
        )}
        title={status === 'error' ? error || 'Save failed' : config.label}
      >
        <motion.div
          animate={config.animate ? { rotate: 360 } : {}}
          transition={
            config.animate
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : {}
          }
        >
          <Icon className="size-4" />
        </motion.div>
        {showLabel && config.label && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-xs font-medium whitespace-nowrap overflow-hidden"
          >
            {config.label}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default SaveIndicator;
