'use client';

import { useState, useEffect, useCallback } from 'react';

export type ViewMode = 'board' | 'list' | 'calendar';

const STORAGE_KEY_PREFIX = 'tasktrox:view-preference:';

interface UseViewPreferenceOptions {
  projectId: string;
  defaultView?: ViewMode;
}

/**
 * Hook for persisting view mode preference per project in localStorage.
 */
export function useViewPreference({
  projectId,
  defaultView = 'board',
}: UseViewPreferenceOptions) {
  const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;

  // Initialize state with default, then hydrate from localStorage
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultView);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['board', 'list', 'calendar'].includes(stored)) {
        setViewModeState(stored as ViewMode);
      }
    } catch {
      // localStorage not available, use default
      console.warn('localStorage not available for view preference');
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Update localStorage when view mode changes
  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        console.warn('Failed to save view preference to localStorage');
      }
    },
    [storageKey]
  );

  return {
    viewMode,
    setViewMode,
    isHydrated,
  };
}

export default useViewPreference;
