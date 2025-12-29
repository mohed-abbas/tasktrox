'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AddTaskFormProps {
  onSubmit: (title: string) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function AddTaskForm({
  onSubmit,
  onCancel,
  isOpen: controlledIsOpen,
  onOpenChange,
  placeholder = 'Enter task title...',
  className,
}: AddTaskFormProps) {
  // Internal state for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Support both controlled and uncontrolled modes
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalIsOpen(value);
      }
    },
    [onOpenChange]
  );

  // Focus input when form opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the element is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset title when form closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setTitle('');
    setIsOpen(false);
    onCancel?.();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedTitle);
      setTitle('');
      // Keep form open for quick successive additions
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // Closed state - show button
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-3',
          'border border-dashed border-gray-200 hover:border-gray-300',
          'hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700',
          'text-sm transition-colors',
          className
        )}
      >
        <Plus className="size-4" />
        <span>Add Task</span>
      </button>
    );
  }

  // Open state - show form
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-xl p-3 shadow-sm',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
    >
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-gray-200',
            'focus:border-gray-400 focus:ring-2 focus:ring-gray-800/10',
            'placeholder:text-gray-400 text-sm outline-none',
            'transition-colors',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
          maxLength={200}
          autoComplete="off"
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">
            Press Enter to add, Esc to cancel
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                'p-1.5 rounded-md text-gray-400 hover:text-gray-600',
                'hover:bg-gray-100 transition-colors',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
              title="Cancel (Esc)"
            >
              <X className="size-4" />
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-gray-800 text-white hover:bg-gray-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddTaskForm;
