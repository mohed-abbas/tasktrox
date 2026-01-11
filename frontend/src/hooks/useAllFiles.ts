'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAllFiles,
  type GlobalFile,
  type GlobalFilesFilters,
} from '@/lib/api/files';

interface UseAllFilesOptions {
  filters?: GlobalFilesFilters;
  enabled?: boolean;
}

export interface ProjectGroup {
  project: { id: string; name: string; color: string };
  files: GlobalFile[];
}

/**
 * Hook for fetching all files across all projects the user is a member of.
 * Supports filtering, sorting, and pagination.
 * Also provides files grouped by project for UI display.
 */
export function useAllFiles({ filters, enabled = true }: UseAllFilesOptions = {}) {
  // Query for fetching all files
  const filesQuery = useQuery({
    queryKey: ['allFiles', filters],
    queryFn: () => getAllFiles(filters),
    staleTime: 30 * 1000, // 30 seconds
    enabled,
  });

  // Group files by project
  const groupedByProject = useMemo<ProjectGroup[]>(() => {
    if (!filesQuery.data?.files) return [];

    const groups = new Map<string, ProjectGroup>();
    for (const file of filesQuery.data.files) {
      const existing = groups.get(file.project.id);
      if (existing) {
        existing.files.push(file);
      } else {
        groups.set(file.project.id, {
          project: file.project,
          files: [file],
        });
      }
    }
    return Array.from(groups.values());
  }, [filesQuery.data?.files]);

  return {
    // Query data
    files: filesQuery.data?.files || [],
    groupedByProject,
    meta: filesQuery.data?.meta,

    // Query states
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,
    refetch: filesQuery.refetch,
  };
}

export default useAllFiles;
