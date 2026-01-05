'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTaskAssignees,
  addAssignee,
  removeAssignee,
  setTaskAssignees,
  getAssignableMembers,
  type Assignee,
  type ProjectMember,
} from '@/lib/api/assignees';

interface UseAssigneesOptions {
  projectId: string;
  taskId?: string | null;
  enabled?: boolean;
}

/**
 * Hook for managing task assignees with optimistic updates.
 */
export function useAssignees({ projectId, taskId, enabled = true }: UseAssigneesOptions) {
  const queryClient = useQueryClient();

  // Query for task assignees
  const assigneesQuery = useQuery({
    queryKey: ['assignees', projectId, taskId],
    queryFn: () => getTaskAssignees(projectId, taskId!),
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000,
  });

  // Query for available project members
  const membersQuery = useQuery({
    queryKey: ['assignable-members', projectId],
    queryFn: () => getAssignableMembers(projectId),
    enabled: enabled,
    staleTime: 60 * 1000, // 1 minute
  });

  // Helper to get current assignees data
  const getAssigneesData = () => {
    return queryClient.getQueryData<Assignee[]>(['assignees', projectId, taskId]) || [];
  };

  // Helper to update task.assignees in the tasks cache
  const updateTaskAssigneesCache = (newAssignees: Assignee[]) => {
    // Map to simpler format used in Task type
    const taskAssignees = newAssignees.map(a => ({
      id: a.id,
      name: a.name,
      avatar: a.avatar,
    }));

    // Update the tasks cache so board reflects changes immediately
    queryClient.setQueryData<{ id: string; assignees?: { id: string; name: string; avatar: string | null }[] }[]>(
      ['tasks', projectId],
      (old) => {
        if (!old) return old;
        return old.map(task =>
          task.id === taskId ? { ...task, assignees: taskAssignees } : task
        );
      }
    );
  };

  // Add assignee mutation with optimistic update
  const addAssigneeMutation = useMutation({
    mutationFn: (userId: string) => addAssignee(projectId, taskId!, userId),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['assignees', projectId, taskId] });
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousAssignees = getAssigneesData();

      // Find user from members list
      const members = queryClient.getQueryData<ProjectMember[]>(['assignable-members', projectId]) || [];
      const user = members.find((m) => m.id === userId);

      if (user) {
        const optimisticAssignee: Assignee = {
          ...user,
          assignedAt: new Date().toISOString(),
        };

        const newAssignees = [...previousAssignees, optimisticAssignee];

        queryClient.setQueryData<Assignee[]>(
          ['assignees', projectId, taskId],
          newAssignees
        );

        // Also update the tasks cache for the board
        updateTaskAssigneesCache(newAssignees);
      }

      return { previousAssignees };
    },
    onSuccess: (newAssignee) => {
      // Update assignees cache with server response (has correct assignedAt)
      const currentAssignees = getAssigneesData();
      // Replace optimistic entry with server response
      const updatedAssignees = currentAssignees.map(a =>
        a.id === newAssignee.id ? newAssignee : a
      );
      queryClient.setQueryData<Assignee[]>(
        ['assignees', projectId, taskId],
        updatedAssignees
      );
      // Update tasks cache with authoritative data
      updateTaskAssigneesCache(updatedAssignees);
    },
    onError: (err, _userId, context) => {
      if (context?.previousAssignees) {
        queryClient.setQueryData(['assignees', projectId, taskId], context.previousAssignees);
        // Rollback tasks cache too
        updateTaskAssigneesCache(context.previousAssignees);
      }
      toast.error('Failed to add assignee', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    // Only invalidate assignees cache, NOT tasks - we updated it in onSuccess
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assignees', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
    },
  });

  // Remove assignee mutation with optimistic update
  const removeAssigneeMutation = useMutation({
    mutationFn: (userId: string) => removeAssignee(projectId, taskId!, userId),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['assignees', projectId, taskId] });
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousAssignees = getAssigneesData();
      const newAssignees = previousAssignees.filter((a) => a.id !== userId);

      queryClient.setQueryData<Assignee[]>(
        ['assignees', projectId, taskId],
        newAssignees
      );

      // Also update the tasks cache for the board
      updateTaskAssigneesCache(newAssignees);

      return { previousAssignees, newAssignees };
    },
    onSuccess: (_result, _userId, context) => {
      // Server confirmed removal - ensure both caches have the correct state
      if (context?.newAssignees) {
        queryClient.setQueryData<Assignee[]>(
          ['assignees', projectId, taskId],
          context.newAssignees
        );
        updateTaskAssigneesCache(context.newAssignees);
      }
    },
    onError: (err, _userId, context) => {
      if (context?.previousAssignees) {
        queryClient.setQueryData(['assignees', projectId, taskId], context.previousAssignees);
        // Rollback tasks cache too
        updateTaskAssigneesCache(context.previousAssignees);
      }
      toast.error('Failed to remove assignee', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    // Only invalidate assignees cache, NOT tasks - we updated it in onSuccess
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assignees', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
    },
  });

  // Set assignees mutation (replace all)
  const setAssigneesMutation = useMutation({
    mutationFn: (userIds: string[]) => setTaskAssignees(projectId, taskId!, userIds),
    onMutate: async (userIds) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['assignees', projectId, taskId] });
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousAssignees = getAssigneesData();

      // Build optimistic assignees from members
      const members = queryClient.getQueryData<ProjectMember[]>(['assignable-members', projectId]) || [];
      const optimisticAssignees: Assignee[] = userIds
        .map((id) => members.find((m) => m.id === id))
        .filter((user): user is ProjectMember => user !== undefined)
        .map((user) => ({
          ...user,
          assignedAt: new Date().toISOString(),
        }));

      queryClient.setQueryData<Assignee[]>(['assignees', projectId, taskId], optimisticAssignees);

      // Also update the tasks cache for the board
      updateTaskAssigneesCache(optimisticAssignees);

      return { previousAssignees };
    },
    onSuccess: (serverAssignees) => {
      // Update with server response (authoritative data with correct timestamps)
      queryClient.setQueryData<Assignee[]>(
        ['assignees', projectId, taskId],
        serverAssignees
      );
      updateTaskAssigneesCache(serverAssignees);
      toast.success('Assignees updated');
    },
    onError: (err, _userIds, context) => {
      if (context?.previousAssignees) {
        queryClient.setQueryData(['assignees', projectId, taskId], context.previousAssignees);
        // Rollback tasks cache too
        updateTaskAssigneesCache(context.previousAssignees);
      }
      toast.error('Failed to update assignees', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    // Only invalidate assignees cache, NOT tasks - we updated it in onSuccess
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assignees', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
    },
  });

  return {
    // Query data
    assignees: assigneesQuery.data || [],
    members: membersQuery.data || [],
    isLoading: assigneesQuery.isLoading,
    isMembersLoading: membersQuery.isLoading,
    error: assigneesQuery.error,

    // Mutations
    addAssignee: addAssigneeMutation.mutate,
    removeAssignee: removeAssigneeMutation.mutate,
    setAssignees: setAssigneesMutation.mutate,

    // Async versions
    addAssigneeAsync: addAssigneeMutation.mutateAsync,
    removeAssigneeAsync: removeAssigneeMutation.mutateAsync,
    setAssigneesAsync: setAssigneesMutation.mutateAsync,

    // Loading states
    isAdding: addAssigneeMutation.isPending,
    isRemoving: removeAssigneeMutation.isPending,
    isSetting: setAssigneesMutation.isPending,
    isMutating:
      addAssigneeMutation.isPending ||
      removeAssigneeMutation.isPending ||
      setAssigneesMutation.isPending,

    // Refetch
    refetch: assigneesQuery.refetch,
    refetchMembers: membersQuery.refetch,
  };
}

export default useAssignees;
