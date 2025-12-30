'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
  type CreateColumnInput,
  type UpdateColumnInput,
} from '@/lib/api/columns';
import type { Project, Column } from '@/lib/api/projects';

interface UseColumnsOptions {
  projectId: string;
}

/**
 * Hook for column CRUD operations with optimistic updates.
 * Provides mutations that update UI immediately and rollback on error.
 */
export function useColumns({ projectId }: UseColumnsOptions) {
  const queryClient = useQueryClient();

  // Helper to get current project data
  const getProjectData = () => {
    return queryClient.getQueryData<Project>(['project', projectId]);
  };

  // Create column mutation with optimistic update
  const createColumnMutation = useMutation({
    mutationFn: (data: CreateColumnInput) => createColumn(projectId, data),
    onMutate: async (newColumnData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      // Snapshot previous value
      const previousProject = getProjectData();

      // Optimistically update
      if (previousProject) {
        const optimisticColumn: Column = {
          id: `temp-${Date.now()}`,
          name: newColumnData.name,
          order: newColumnData.order ?? (previousProject.columns?.length ?? 0),
          color: newColumnData.color ?? null,
          projectId,
        };

        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          columns: [...(previousProject.columns || []), optimisticColumn],
        });
      }

      return { previousProject };
    },
    onError: (err, _newColumn, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      toast.error('Failed to create column', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Update column mutation with optimistic update
  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: UpdateColumnInput }) =>
      updateColumn(projectId, columnId, data),
    onMutate: async ({ columnId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      const previousProject = getProjectData();

      if (previousProject?.columns) {
        const updatedColumns = previousProject.columns.map((col) =>
          col.id === columnId ? { ...col, ...data } : col
        );

        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          columns: updatedColumns,
        });
      }

      return { previousProject };
    },
    onError: (err, _vars, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      toast.error('Failed to update column', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Delete column mutation with optimistic update
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => deleteColumn(projectId, columnId),
    onMutate: async (columnId) => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      const previousProject = getProjectData();

      if (previousProject?.columns) {
        const filteredColumns = previousProject.columns.filter(
          (col) => col.id !== columnId
        );

        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          columns: filteredColumns,
        });
      }

      return { previousProject };
    },
    onError: (err, _columnId, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      toast.error('Failed to delete column', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Reorder column mutation with optimistic update
  const reorderColumnMutation = useMutation({
    mutationFn: ({ columnId, newOrder }: { columnId: string; newOrder: number }) =>
      reorderColumn(projectId, columnId, newOrder),
    onMutate: async ({ columnId, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      const previousProject = getProjectData();

      if (previousProject?.columns) {
        // Sort columns by current order
        const sortedColumns = [...previousProject.columns].sort((a, b) => a.order - b.order);

        // Find current index of the column being moved
        const currentIndex = sortedColumns.findIndex((col) => col.id === columnId);
        if (currentIndex === -1) return { previousProject };

        // Remove column from current position and insert at new position
        const [movedColumn] = sortedColumns.splice(currentIndex, 1);
        sortedColumns.splice(newOrder, 0, movedColumn);

        // Update order values
        const reorderedColumns = sortedColumns.map((col, index) => ({
          ...col,
          order: index,
        }));

        queryClient.setQueryData<Project>(['project', projectId], {
          ...previousProject,
          columns: reorderedColumns,
        });
      }

      return { previousProject };
    },
    onError: (err, _vars, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      toast.error('Failed to reorder column', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    // No onSuccess refetch - optimistic update is already correct
  });

  return {
    // Mutations
    createColumn: createColumnMutation.mutate,
    updateColumn: updateColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    reorderColumn: reorderColumnMutation.mutate,

    // Async versions for awaiting
    createColumnAsync: createColumnMutation.mutateAsync,
    updateColumnAsync: updateColumnMutation.mutateAsync,
    deleteColumnAsync: deleteColumnMutation.mutateAsync,
    reorderColumnAsync: reorderColumnMutation.mutateAsync,

    // Loading states
    isCreating: createColumnMutation.isPending,
    isUpdating: updateColumnMutation.isPending,
    isDeleting: deleteColumnMutation.isPending,
    isReordering: reorderColumnMutation.isPending,
    isLoading:
      createColumnMutation.isPending ||
      updateColumnMutation.isPending ||
      deleteColumnMutation.isPending ||
      reorderColumnMutation.isPending,

    // Error states
    createError: createColumnMutation.error,
    updateError: updateColumnMutation.error,
    deleteError: deleteColumnMutation.error,
    reorderError: reorderColumnMutation.error,
  };
}

export default useColumns;
