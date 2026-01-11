'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  File,
  Download,
  Loader2,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GlobalFile } from '@/lib/api/files';
import { getFileDownloadUrl } from '@/lib/api/files';
import { formatFileSize, isImageFile, fetchSignedDownloadUrl } from '@/lib/api/attachments';

interface FileGridCardProps {
  file: GlobalFile;
  onPreview?: (file: GlobalFile) => void;
  className?: string;
}

/**
 * Get icon for file type based on MIME type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-10 h-10 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-10 h-10 text-red-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') {
    return <FileSpreadsheet className="w-10 h-10 text-green-500" />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="w-10 h-10 text-blue-600" />;
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('gzip') || mimeType.includes('7z')) {
    return <FileArchive className="w-10 h-10 text-amber-500" />;
  }
  return <File className="w-10 h-10 text-gray-500" />;
}

/**
 * FileGridCard - Displays a single file as a card with thumbnail/icon
 */
export function FileGridCard({
  file,
  onPreview,
  className,
}: FileGridCardProps) {
  const router = useRouter();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isImage = isImageFile(file.mimeType);

  // Fetch signed URL for image thumbnails
  useEffect(() => {
    if (isImage) {
      fetchSignedDownloadUrl(file.id)
        .then(setThumbnailUrl)
        .catch(() => setThumbnailUrl(null));
    }
  }, [file.id, isImage]);

  // Handle download
  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const url = await getFileDownloadUrl(file.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [file.id]);

  // Handle preview
  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview && isImage) {
      onPreview(file);
    }
  }, [file, onPreview, isImage]);

  // Navigate to task
  const handleGoToTask = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/projects/${file.project.id}?task=${file.task.id}`);
  }, [router, file.project.id, file.task.id]);

  // Card click opens preview for images, otherwise go to task
  const handleCardClick = useCallback(() => {
    if (isImage && onPreview) {
      onPreview(file);
    } else {
      router.push(`/projects/${file.project.id}?task=${file.task.id}`);
    }
  }, [isImage, onPreview, file, router]);

  return (
    <div
      className={cn(
        'relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 transition-all',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Thumbnail/Icon area */}
      <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center">
        {isImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={file.originalName}
            className="w-full h-full object-cover"
            onError={() => setThumbnailUrl(null)}
          />
        ) : (
          getFileIcon(file.mimeType)
        )}

        {/* Hover overlay with actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
            {isImage && onPreview && (
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9"
                onClick={handlePreview}
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9"
              onClick={handleGoToTask}
              title="Go to task"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
          {file.originalName}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatFileSize(file.size)}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5" title={file.task.title}>
          {file.task.title}
        </p>
      </div>
    </div>
  );
}

/**
 * Skeleton variant for loading state
 */
FileGridCard.Skeleton = function FileGridCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton className="aspect-[4/3]" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};

export default FileGridCard;
