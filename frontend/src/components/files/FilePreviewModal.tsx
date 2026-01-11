'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Download, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { GlobalFile } from '@/lib/api/files';
import { getFileDownloadUrl } from '@/lib/api/files';
import { fetchSignedDownloadUrl, isImageFile } from '@/lib/api/attachments';

interface FilePreviewModalProps {
  file: GlobalFile | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * FilePreviewModal - Modal for previewing files (images and PDFs)
 */
export function FilePreviewModal({
  file,
  isOpen,
  onClose,
}: FilePreviewModalProps) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL for preview
  useEffect(() => {
    if (!file || !isOpen) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const isImage = isImageFile(file.mimeType);
    const isPdf = file.mimeType === 'application/pdf';

    if (!isImage && !isPdf) {
      setError('Preview not available for this file type');
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchSignedDownloadUrl(file.id)
      .then(setPreviewUrl)
      .catch(() => setError('Failed to load preview'))
      .finally(() => setIsLoading(false));
  }, [file, isOpen]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!file) return;
    setIsDownloading(true);
    try {
      const url = await getFileDownloadUrl(file.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [file]);

  // Navigate to task
  const handleGoToTask = useCallback(() => {
    if (!file) return;
    onClose();
    router.push(`/projects/${file.project.id}?task=${file.task.id}`);
  }, [file, router, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!file) return null;

  const isImage = isImageFile(file.mimeType);
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/90"
          onClick={onClose}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-white font-medium truncate">{file.originalName}</p>
              <p className="text-gray-400 text-sm truncate">
                {file.task.title} &middot; {file.project.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={handleGoToTask}
                title="Go to task"
              >
                <ExternalLink className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download"
              >
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onClose}
                title="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <p className="text-gray-400">Loading preview...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-gray-400">{error}</p>
                <Button variant="secondary" onClick={handleDownload}>
                  Download instead
                </Button>
              </div>
            )}

            {previewUrl && isImage && (
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={previewUrl}
                alt={file.originalName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}

            {previewUrl && isPdf && (
              <iframe
                src={previewUrl}
                className="w-full h-full max-w-4xl bg-white rounded-lg"
                title={file.originalName}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FilePreviewModal;
