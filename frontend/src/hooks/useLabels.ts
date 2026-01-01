'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProjectLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  type Label,
  type CreateLabelInput,
  type UpdateLabelInput,
} from '@/lib/api/labels';

interface UseLabelsOptions {
  projectId: string;
}

/**
 * Hook for project label CRUD operations.
 * Provides query for fetching labels and mutations for create/update/delete.
 */
export function useLabels({ projectId }: UseLabelsOptions) {
  const queryClient = useQueryClient();

  // Fetch project labels
  const {
    data: labels = [],
    isLoading,
    error,
  } = useQuery<Label[]>({
    queryKey: ['labels', projectId],
    queryFn: () => getProjectLabels(projectId),
    enabled: !!projectId,
  });

  // Create label mutation
  const createLabelMutation = useMutation({
    mutationFn: (data: CreateLabelInput) => createLabel(projectId, data),
    onSuccess: (newLabel) => {
      // Update cache with new label
      queryClient.setQueryData<Label[]>(['labels', projectId], (old = []) => [
        ...old,
        newLabel,
      ]);
      toast.success('Label created');
    },
    onError: (err) => {
      toast.error('Failed to create label', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
    },
  });

  // Update label mutation
  const updateLabelMutation = useMutation({
    mutationFn: ({ labelId, data }: { labelId: string; data: UpdateLabelInput }) =>
      updateLabel(projectId, labelId, data),
    onSuccess: (updatedLabel) => {
      // Update cache with updated label
      queryClient.setQueryData<Label[]>(['labels', projectId], (old = []) =>
        old.map((label) => (label.id === updatedLabel.id ? updatedLabel : label))
      );
      toast.success('Label updated');
    },
    onError: (err) => {
      toast.error('Failed to update label', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
    },
  });

  // Delete label mutation
  const deleteLabelMutation = useMutation({
    mutationFn: (labelId: string) => deleteLabel(projectId, labelId),
    onMutate: async (labelId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['labels', projectId] });

      // Snapshot previous value
      const previousLabels = queryClient.getQueryData<Label[]>(['labels', projectId]);

      // Optimistically remove the label
      queryClient.setQueryData<Label[]>(['labels', projectId], (old = []) =>
        old.filter((label) => label.id !== labelId)
      );

      return { previousLabels };
    },
    onSuccess: () => {
      toast.success('Label deleted');
    },
    onError: (err, _labelId, context) => {
      // Rollback on error
      if (context?.previousLabels) {
        queryClient.setQueryData(['labels', projectId], context.previousLabels);
      }
      toast.error('Failed to delete label', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
      // Also invalidate project query as tasks may have this label
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return {
    // Data
    labels,
    isLoading,
    error,

    // Mutations
    createLabel: createLabelMutation.mutateAsync,
    updateLabel: (labelId: string, data: UpdateLabelInput) =>
      updateLabelMutation.mutateAsync({ labelId, data }),
    deleteLabel: deleteLabelMutation.mutateAsync,

    // Loading states
    isCreating: createLabelMutation.isPending,
    isUpdating: updateLabelMutation.isPending,
    isDeleting: deleteLabelMutation.isPending,
  };
}

export default useLabels;
