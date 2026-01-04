'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment,
} from '@/lib/api/comments';

interface UseCommentsOptions {
  projectId: string;
  taskId: string;
  enabled?: boolean;
}

/**
 * Hook for managing task comments
 */
export function useComments({
  projectId,
  taskId,
  enabled = true,
}: UseCommentsOptions) {
  const queryClient = useQueryClient();

  // Query for fetching comments
  const query = useQuery({
    queryKey: ['comments', projectId, taskId],
    queryFn: () => getTaskComments(projectId, taskId),
    enabled: !!projectId && !!taskId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for creating a comment
  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(projectId, taskId, content),
    onSuccess: (newComment) => {
      // Add new comment to cache
      queryClient.setQueryData<Comment[]>(
        ['comments', projectId, taskId],
        (old) => (old ? [...old, newComment] : [newComment])
      );
    },
  });

  // Mutation for updating a comment
  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(projectId, commentId, content),
    onSuccess: (updatedComment) => {
      // Update comment in cache
      queryClient.setQueryData<Comment[]>(
        ['comments', projectId, taskId],
        (old) =>
          old?.map((c) => (c.id === updatedComment.id ? updatedComment : c)) ?? []
      );
    },
  });

  // Mutation for deleting a comment
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(projectId, commentId),
    onSuccess: (_data, commentId) => {
      // Remove comment from cache
      queryClient.setQueryData<Comment[]>(
        ['comments', projectId, taskId],
        (old) => old?.filter((c) => c.id !== commentId) ?? []
      );
    },
  });

  return {
    // Query data
    comments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Create
    createComment: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // Update
    updateComment: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    // Delete
    deleteComment: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    // Refetch
    refetch: query.refetch,
  };
}

export default useComments;
