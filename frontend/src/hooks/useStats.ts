'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getProjectStats,
  type DashboardStats,
  type SingleProjectStats,
} from '@/lib/api/stats';

/**
 * Hook for fetching dashboard stats
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook for fetching project-specific stats
 */
export function useProjectStats(projectId: string | undefined) {
  return useQuery<SingleProjectStats>({
    queryKey: ['stats', 'project', projectId],
    queryFn: () => getProjectStats(projectId!),
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute
  });
}
