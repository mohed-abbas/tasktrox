'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  /** Current value to track for changes */
  value: T;
  /** Original value to compare against */
  originalValue: T;
  /** Function to call when saving */
  onSave: (value: T) => Promise<void>;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** How long to show "saved" status before returning to idle */
  savedDurationMs?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
  /** Custom comparison function */
  isEqual?: (a: T, b: T) => boolean;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Error message if status is 'error' */
  error: string | null;
  /** Manually trigger save */
  save: () => Promise<void>;
  /** Reset status to idle */
  reset: () => void;
  /** Whether there are unsaved changes */
  hasChanges: boolean;
}

/**
 * Hook for debounced auto-saving with status tracking.
 * Automatically saves changes after a debounce period and provides
 * visual feedback through status states.
 */
export function useAutoSave<T>({
  value,
  originalValue,
  onSave,
  debounceMs = 500,
  savedDurationMs = 2000,
  enabled = true,
  isEqual = defaultIsEqual,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and tracking
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastSavedValueRef = useRef<T>(originalValue);
  const pendingValueRef = useRef<T>(value);

  // Track if there are unsaved changes
  const hasChanges = !isEqual(value, lastSavedValueRef.current);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  // Core save function
  const performSave = useCallback(async (valueToSave: T) => {
    if (!isMountedRef.current) return;

    // Don't save if value hasn't changed from last saved
    if (isEqual(valueToSave, lastSavedValueRef.current)) {
      setStatus('idle');
      return;
    }

    setStatus('saving');
    setError(null);

    try {
      await onSave(valueToSave);

      if (!isMountedRef.current) return;

      lastSavedValueRef.current = valueToSave;
      setStatus('saved');

      // Clear saved status after duration
      savedTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setStatus('idle');
        }
      }, savedDurationMs);
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      setError(errorMessage);
      setStatus('error');
    }
  }, [onSave, savedDurationMs, isEqual]);

  // Manual save function
  const save = useCallback(async () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await performSave(pendingValueRef.current);
  }, [performSave]);

  // Reset function
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
    setStatus('idle');
    setError(null);
  }, []);

  // Watch for value changes and trigger debounced save
  useEffect(() => {
    pendingValueRef.current = value;

    if (!enabled) return;

    // Don't trigger save if value matches last saved
    if (isEqual(value, lastSavedValueRef.current)) {
      // If we were pending, go back to idle
      if (status === 'pending') {
        setStatus('idle');
      }
      return;
    }

    // Clear existing timers
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }

    // Set status to pending (changes detected but not yet saving)
    if (status === 'idle' || status === 'saved') {
      setStatus('pending');
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave(value);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, enabled, debounceMs, performSave, isEqual, status]);

  // Update lastSavedValue when originalValue changes (e.g., task reloaded)
  useEffect(() => {
    lastSavedValueRef.current = originalValue;
  }, [originalValue]);

  return {
    status,
    error,
    save,
    reset,
    hasChanges,
  };
}

/**
 * Default equality check using JSON stringify.
 * Works for simple objects but may not handle all edge cases.
 */
function defaultIsEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return a === b;

  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export default useAutoSave;
