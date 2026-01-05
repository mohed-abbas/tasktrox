'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTaskAttachments,
  uploadAttachment,
  deleteAttachment,
  type Attachment,
} from '@/lib/api/attachments';

interface UseAttachmentsOptions {
  projectId: string;
  taskId: string;
  enabled?: boolean;
}

// Minimal task type for cache updates
interface TaskCacheItem {
  id: string;
  _count?: { attachments: number; comments: number };
}

/**
 * Hook for managing task attachments with optimistic updates
 */
export function useAttachments({
  projectId,
  taskId,
  enabled = true,
}: UseAttachmentsOptions) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to update attachment count in tasks cache
  const updateTaskAttachmentCount = (delta: number) => {
    queryClient.setQueryData<TaskCacheItem[]>(
      ['tasks', projectId],
      (old) => {
        if (!old) return old;
        return old.map(task => {
          if (task.id !== taskId) return task;
          const currentCount = task._count?.attachments ?? 0;
          return {
            ...task,
            _count: {
              ...task._count,
              attachments: Math.max(0, currentCount + delta),
              comments: task._count?.comments ?? 0,
            },
          };
        });
      }
    );
  };

  // Query for fetching attachments
  const query = useQuery({
    queryKey: ['attachments', projectId, taskId],
    queryFn: () => getTaskAttachments(projectId, taskId),
    enabled: !!projectId && !!taskId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for uploading an attachment
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(projectId, taskId, file),
    onMutate: async () => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
    },
    onSuccess: (newAttachment) => {
      // Add new attachment to cache
      queryClient.setQueryData<Attachment[]>(
        ['attachments', projectId, taskId],
        (old) => (old ? [newAttachment, ...old] : [newAttachment])
      );
      // Update attachment count in tasks cache directly (no invalidation)
      updateTaskAttachmentCount(1);
      // Invalidate single task cache for modal consistency
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      toast.success('File uploaded successfully');
    },
    onError: (err) => {
      toast.error('Failed to upload file', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
  });

  // Mutation for deleting an attachment
  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => {
      setDeletingId(attachmentId);
      return deleteAttachment(projectId, attachmentId);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
    },
    onSuccess: (_data, attachmentId) => {
      // Remove attachment from cache
      queryClient.setQueryData<Attachment[]>(
        ['attachments', projectId, taskId],
        (old) => old?.filter((a) => a.id !== attachmentId) ?? []
      );
      // Update attachment count in tasks cache directly (no invalidation)
      updateTaskAttachmentCount(-1);
      // Invalidate single task cache for modal consistency
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      toast.success('Attachment deleted');
    },
    onError: (err) => {
      toast.error('Failed to delete attachment', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  return {
    // Query data
    attachments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Upload
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,

    // Delete
    deleteAttachment: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deletingId,
    deleteError: deleteMutation.error,

    // Refetch
    refetch: query.refetch,
  };
}

export default useAttachments;
