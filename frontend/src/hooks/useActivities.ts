'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getProjectActivities,
  getTaskActivities,
  getUserActivities,
  type Activity,
} from '@/lib/api/activities';

interface UseProjectActivitiesOptions {
  projectId: string;
  enabled?: boolean;
}

interface UseTaskActivitiesOptions {
  projectId: string;
  taskId: string;
  enabled?: boolean;
}

interface UseUserActivitiesOptions {
  enabled?: boolean;
}

const DEFAULT_LIMIT = 20;

/**
 * Hook for fetching project activities with infinite scroll support.
 */
export function useProjectActivities({
  projectId,
  enabled = true,
}: UseProjectActivitiesOptions) {
  return useInfiniteQuery({
    queryKey: ['activities', 'project', projectId],
    queryFn: ({ pageParam = 0 }) =>
      getProjectActivities(projectId, { limit: DEFAULT_LIMIT, offset: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasMore) return undefined;
      return lastPage.meta.offset + lastPage.meta.limit;
    },
    initialPageParam: 0,
    enabled: !!projectId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for fetching task activities (simpler version without infinite scroll).
 */
export function useTaskActivities({
  projectId,
  taskId,
  enabled = true,
}: UseTaskActivitiesOptions) {
  return useQuery({
    queryKey: ['activities', 'task', projectId, taskId],
    queryFn: () => getTaskActivities(projectId, taskId, { limit: 50 }),
    enabled: !!projectId && !!taskId && enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for fetching user's recent activities across all projects.
 */
export function useUserActivities({ enabled = true }: UseUserActivitiesOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['activities', 'user'],
    queryFn: ({ pageParam = 0 }) =>
      getUserActivities({ limit: DEFAULT_LIMIT, offset: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasMore) return undefined;
      return lastPage.meta.offset + lastPage.meta.limit;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Helper to flatten paginated activities.
 */
export function flattenActivities(
  pages: Array<{ activities: Activity[] }> | undefined
): Activity[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.activities);
}

export default {
  useProjectActivities,
  useTaskActivities,
  useUserActivities,
  flattenActivities,
};
