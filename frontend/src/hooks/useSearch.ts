'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { search, type SearchResults, type SearchParams } from '@/lib/api/search';

interface UseSearchOptions {
  projectId?: string;
  limit?: number;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Hook for searching tasks and projects with debouncing.
 */
export function useSearch({
  projectId,
  limit = 10,
  debounceMs = 300,
  enabled = true,
}: UseSearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, debounceMs);

  // Only search if we have a query with at least 2 characters
  const shouldSearch = enabled && debouncedQuery.trim().length >= 2;

  const searchParams: SearchParams = useMemo(
    () => ({
      q: debouncedQuery.trim(),
      projectId,
      limit,
    }),
    [debouncedQuery, projectId, limit]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SearchResults>({
    queryKey: ['search', searchParams],
    queryFn: () => search(searchParams),
    enabled: shouldSearch,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const hasResults = (data?.tasks?.length || 0) + (data?.projects?.length || 0) > 0;
  const isEmpty = shouldSearch && !isLoading && !hasResults;

  return {
    // State
    query,
    setQuery,
    debouncedQuery,
    isSearching: query.trim().length > 0,

    // Results
    results: data || { tasks: [], projects: [] },
    tasks: data?.tasks || [],
    projects: data?.projects || [],
    hasResults,
    isEmpty,

    // Status
    isLoading: isLoading && shouldSearch,
    error,

    // Actions
    clearSearch,
    refetch,
  };
}

export default useSearch;
