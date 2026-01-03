'use client';

import { cn } from '@/lib/utils';
import { Loader2, Paperclip } from 'lucide-react';
import { AttachmentItem } from './AttachmentItem';
import type { Attachment } from '@/lib/api/attachments';
import { getAttachmentDownloadUrl } from '@/lib/api/attachments';

interface AttachmentListProps {
  attachments: Attachment[];
  isLoading?: boolean;
  onDelete?: (attachmentId: string) => void;
  deletingId?: string | null;
  className?: string;
}

/**
 * AttachmentList - Displays a list of attachments
 */
export function AttachmentList({
  attachments,
  isLoading = false,
  onDelete,
  deletingId,
  className,
}: AttachmentListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Empty state
  if (attachments.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-8 text-gray-500',
          className
        )}
      >
        <Paperclip className="w-8 h-8 mb-2 text-gray-300" />
        <p className="text-sm">No attachments yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {attachments.map((attachment) => (
        <AttachmentItem
          key={attachment.id}
          attachment={attachment}
          downloadUrl={getAttachmentDownloadUrl(attachment.id)}
          onDelete={onDelete}
          isDeleting={deletingId === attachment.id}
        />
      ))}
    </div>
  );
}

export default AttachmentList;
