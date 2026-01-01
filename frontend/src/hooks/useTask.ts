'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTask,
  updateTask,
  deleteTask,
  type Task,
  type UpdateTaskInput,
} from '@/lib/api/tasks';

interface UseTaskOptions {
  projectId: string;
  taskId: string | null;
  enabled?: boolean;
}

/**
 * Hook for single task operations.
 * Used by TaskDetailModal for viewing and editing a specific task.
 */
export function useTask({ projectId, taskId, enabled = true }: UseTaskOptions) {
  const queryClient = useQueryClient();

  // Query for fetching single task
  const taskQuery = useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () => {
      if (!taskId) throw new Error('Task ID is required');
      return getTask(projectId, taskId);
    },
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTaskInput) => {
      if (!taskId) throw new Error('Task ID is required');
      return updateTask(projectId, taskId, data);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['task', projectId, taskId] });

      // Snapshot previous value
      const previousTask = queryClient.getQueryData<Task>(['task', projectId, taskId]);

      // Optimistically update
      if (previousTask) {
        queryClient.setQueryData<Task>(['task', projectId, taskId], {
          ...previousTask,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousTask };
    },
    onError: (err, _data, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(['task', projectId, taskId], context.previousTask);
      }
      toast.error('Failed to update task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      // Invalidate both single task and tasks list
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!taskId) throw new Error('Task ID is required');
      return deleteTask(projectId, taskId);
    },
    onSuccess: () => {
      toast.success('Task deleted');
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      // Remove single task from cache
      queryClient.removeQueries({ queryKey: ['task', projectId, taskId] });
    },
    onError: (err) => {
      toast.error('Failed to delete task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
  });

  return {
    // Query data
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
    refetch: taskQuery.refetch,

    // Mutations
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,

    // Async versions
    updateTaskAsync: updateMutation.mutateAsync,
    deleteTaskAsync: deleteMutation.mutateAsync,

    // Loading states
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMutating: updateMutation.isPending || deleteMutation.isPending,

    // Error states
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}

export default useTask;
