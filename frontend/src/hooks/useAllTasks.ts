'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllTasks,
  toggleTaskComplete,
  type GlobalTask,
  type GlobalTasksFilters,
  type GlobalTasksResponse,
} from '@/lib/api/tasks';

interface UseAllTasksOptions {
  filters?: GlobalTasksFilters;
  enabled?: boolean;
}

/**
 * Hook for fetching all tasks across all projects the user is a member of.
 * Supports filtering, sorting, and pagination.
 * Also provides a mutation for toggling task completion status.
 */
export function useAllTasks({ filters, enabled = true }: UseAllTasksOptions = {}) {
  const queryClient = useQueryClient();

  // Query for fetching all tasks
  const tasksQuery = useQuery({
    queryKey: ['allTasks', filters],
    queryFn: () => getAllTasks(filters),
    staleTime: 30 * 1000, // 30 seconds
    enabled,
  });

  // Separate active and completed tasks
  const activeTasks = (tasksQuery.data?.tasks || []).filter(
    (task) => task.completedAt === null
  );
  const completedTasks = (tasksQuery.data?.tasks || []).filter(
    (task) => task.completedAt !== null
  );

  // Toggle complete mutation with optimistic update
  const toggleCompleteMutation = useMutation({
    mutationFn: ({
      task,
      completed,
    }: {
      task: GlobalTask;
      completed: boolean;
    }) => toggleTaskComplete(task.project.id, task.id, completed),
    onMutate: async ({ task, completed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['allTasks'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<GlobalTasksResponse>([
        'allTasks',
        filters,
      ]);

      // Optimistically update the cache
      if (previousData) {
        const updatedTasks = previousData.tasks.map((t) => {
          if (t.id === task.id) {
            return {
              ...t,
              completedAt: completed ? new Date().toISOString() : null,
            };
          }
          return t;
        });

        queryClient.setQueryData<GlobalTasksResponse>(['allTasks', filters], {
          ...previousData,
          tasks: updatedTasks,
        });
      }

      return { previousData };
    },
    onError: (err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['allTasks', filters], context.previousData);
      }
      toast.error('Failed to update task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSuccess: (_data, { completed }) => {
      toast.success(completed ? 'Task completed' : 'Task reopened');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      // Also invalidate project-specific task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    // Query data
    tasks: tasksQuery.data?.tasks || [],
    activeTasks,
    completedTasks,
    meta: tasksQuery.data?.meta,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,

    // Mutations
    toggleComplete: (task: GlobalTask, completed: boolean) =>
      toggleCompleteMutation.mutate({ task, completed }),
    toggleCompleteAsync: (task: GlobalTask, completed: boolean) =>
      toggleCompleteMutation.mutateAsync({ task, completed }),

    // Loading states
    isToggling: toggleCompleteMutation.isPending,
  };
}

export default useAllTasks;
