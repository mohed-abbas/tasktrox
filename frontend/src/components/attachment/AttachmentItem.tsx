'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Loader2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Attachment } from '@/lib/api/attachments';
import { formatFileSize, isImageFile, getFileExtension, fetchSignedDownloadUrl } from '@/lib/api/attachments';

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete?: (attachmentId: string) => void;
  onPreview?: (url: string, name: string) => void;
  isDeleting?: boolean;
  className?: string;
}

/**
 * Get icon for file type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-8 h-8 text-red-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="w-8 h-8 text-blue-600" />;
  }
  return <File className="w-8 h-8 text-gray-500" />;
}

/**
 * AttachmentItem - Displays a single attachment with actions
 */
export function AttachmentItem({
  attachment,
  onDelete,
  onPreview,
  isDeleting = false,
  className,
}: AttachmentItemProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(attachment.createdAt), {
    addSuffix: true,
  });

  const isImage = isImageFile(attachment.mimeType);
  const extension = getFileExtension(attachment.mimeType).toUpperCase();

  // Fetch signed URL for image thumbnails
  useEffect(() => {
    if (isImage) {
      fetchSignedDownloadUrl(attachment.id)
        .then(setThumbnailUrl)
        .catch(() => setThumbnailUrl(null));
    }
  }, [attachment.id, isImage]);

  // Handle download click - fetch signed URL and trigger download
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const url = await fetchSignedDownloadUrl(attachment.id);
      // Open in new tab to trigger download
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [attachment.id]);

  // Handle preview click for images
  const handlePreview = useCallback(async () => {
    if (!onPreview) return;
    try {
      const url = thumbnailUrl || await fetchSignedDownloadUrl(attachment.id);
      onPreview(url, attachment.originalName);
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  }, [attachment.id, attachment.originalName, thumbnailUrl, onPreview]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors',
        className
      )}
    >
      {/* File icon or preview */}
      <div
        className={cn(
          "flex-shrink-0",
          isImage && onPreview && "cursor-pointer"
        )}
        onClick={isImage && onPreview ? handlePreview : undefined}
      >
        {isImage && thumbnailUrl ? (
          <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={attachment.originalName}
              className="w-full h-full object-cover"
              onError={() => setThumbnailUrl(null)}
            />
          </div>
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
            {getFileIcon(attachment.mimeType)}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {attachment.originalName}
        </p>
        <p className="text-xs text-gray-500">
          {extension} &middot; {formatFileSize(attachment.size)} &middot; {timeAgo}
        </p>
        <p className="text-xs text-gray-400 truncate">
          by {attachment.uploadedBy.name}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Preview button for images */}
        {isImage && onPreview && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}

        {/* Download button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(attachment.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default AttachmentItem;
