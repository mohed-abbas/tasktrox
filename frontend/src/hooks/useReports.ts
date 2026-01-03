'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getTasksOverTime,
  getTasksByStatus,
  getTasksByAssignee,
  getTasksByPriority,
  getCompletionMetrics,
  type TasksOverTimeData,
  type TasksByStatusData,
  type TasksByAssigneeData,
  type TasksByPriorityData,
  type CompletionMetrics,
} from '@/lib/api/reports';

// Query keys
export const reportsKeys = {
  all: ['reports'] as const,
  tasksOverTime: (projectId: string, days: number) =>
    [...reportsKeys.all, 'tasks-over-time', projectId, days] as const,
  tasksByStatus: (projectId: string) => [...reportsKeys.all, 'tasks-by-status', projectId] as const,
  tasksByAssignee: (projectId: string) =>
    [...reportsKeys.all, 'tasks-by-assignee', projectId] as const,
  tasksByPriority: (projectId: string) =>
    [...reportsKeys.all, 'tasks-by-priority', projectId] as const,
  completionMetrics: (projectId: string) =>
    [...reportsKeys.all, 'completion-metrics', projectId] as const,
};

// Hook for tasks over time (line chart)
export function useTasksOverTime(projectId: string | undefined, days: number = 30) {
  return useQuery<TasksOverTimeData[], Error>({
    queryKey: reportsKeys.tasksOverTime(projectId ?? '', days),
    queryFn: () => getTasksOverTime(projectId!, days),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
  });
}

// Hook for tasks by status (pie chart)
export function useTasksByStatus(projectId: string | undefined) {
  return useQuery<TasksByStatusData[], Error>({
    queryKey: reportsKeys.tasksByStatus(projectId ?? ''),
    queryFn: () => getTasksByStatus(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for tasks by assignee (bar chart)
export function useTasksByAssignee(projectId: string | undefined) {
  return useQuery<TasksByAssigneeData[], Error>({
    queryKey: reportsKeys.tasksByAssignee(projectId ?? ''),
    queryFn: () => getTasksByAssignee(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for tasks by priority
export function useTasksByPriority(projectId: string | undefined) {
  return useQuery<TasksByPriorityData[], Error>({
    queryKey: reportsKeys.tasksByPriority(projectId ?? ''),
    queryFn: () => getTasksByPriority(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for completion metrics
export function useCompletionMetrics(projectId: string | undefined) {
  return useQuery<CompletionMetrics, Error>({
    queryKey: reportsKeys.completionMetrics(projectId ?? ''),
    queryFn: () => getCompletionMetrics(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// Combined hook for all reports data
export function useProjectReports(projectId: string | undefined, days: number = 30) {
  const tasksOverTime = useTasksOverTime(projectId, days);
  const tasksByStatus = useTasksByStatus(projectId);
  const tasksByAssignee = useTasksByAssignee(projectId);
  const tasksByPriority = useTasksByPriority(projectId);
  const completionMetrics = useCompletionMetrics(projectId);

  return {
    tasksOverTime,
    tasksByStatus,
    tasksByAssignee,
    tasksByPriority,
    completionMetrics,
    isLoading:
      tasksOverTime.isLoading ||
      tasksByStatus.isLoading ||
      tasksByAssignee.isLoading ||
      tasksByPriority.isLoading ||
      completionMetrics.isLoading,
    isError:
      tasksOverTime.isError ||
      tasksByStatus.isError ||
      tasksByAssignee.isError ||
      tasksByPriority.isError ||
      completionMetrics.isError,
  };
}
