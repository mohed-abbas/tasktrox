'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Paperclip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttachmentItem } from './AttachmentItem';
import type { Attachment } from '@/lib/api/attachments';

interface AttachmentListProps {
  attachments: Attachment[];
  isLoading?: boolean;
  onDelete?: (attachmentId: string) => void;
  deletingId?: string | null;
  className?: string;
}

/**
 * AttachmentList - Displays a list of attachments with image preview modal
 */
export function AttachmentList({
  attachments,
  isLoading = false,
  onDelete,
  deletingId,
  className,
}: AttachmentListProps) {
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const handlePreview = useCallback((url: string, name: string) => {
    setPreviewImage({ url, name });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

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
    <>
      <div className={cn('space-y-2', className)}>
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onDelete={onDelete}
            onPreview={handlePreview}
            isDeleting={deletingId === attachment.id}
          />
        ))}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={closePreview}
          >
            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={previewImage.url}
              alt={previewImage.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image name */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-lg text-white text-sm">
              {previewImage.name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AttachmentList;
