'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

/**
 * Hook for managing task attachments
 */
export function useAttachments({
  projectId,
  taskId,
  enabled = true,
}: UseAttachmentsOptions) {
  const queryClient = useQueryClient();

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
    onSuccess: (newAttachment) => {
      // Add new attachment to cache
      queryClient.setQueryData<Attachment[]>(
        ['attachments', projectId, taskId],
        (old) => (old ? [newAttachment, ...old] : [newAttachment])
      );
    },
  });

  // Mutation for deleting an attachment
  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(projectId, attachmentId),
    onSuccess: (_data, attachmentId) => {
      // Remove attachment from cache
      queryClient.setQueryData<Attachment[]>(
        ['attachments', projectId, taskId],
        (old) => old?.filter((a) => a.id !== attachmentId) ?? []
      );
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
    deleteError: deleteMutation.error,

    // Refetch
    refetch: query.refetch,
  };
}

export default useAttachments;
