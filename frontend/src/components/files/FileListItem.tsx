'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
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
import { formatFileSize, isImageFile } from '@/lib/api/attachments';

interface FileListItemProps {
  file: GlobalFile;
  onPreview?: (file: GlobalFile) => void;
  className?: string;
}

/**
 * Get icon for file type based on MIME type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') {
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('gzip') || mimeType.includes('7z')) {
    return <FileArchive className="w-5 h-5 text-amber-500" />;
  }
  return <File className="w-5 h-5 text-gray-500" />;
}

/**
 * FileListItem - Displays a single file in list view with actions
 */
export function FileListItem({
  file,
  onPreview,
  className,
}: FileListItemProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(file.createdAt), {
    addSuffix: true,
  });

  const isImage = isImageFile(file.mimeType);

  // Handle download
  const handleDownload = useCallback(async () => {
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
  const handlePreview = useCallback(() => {
    if (onPreview && isImage) {
      onPreview(file);
    }
  }, [file, onPreview, isImage]);

  // Navigate to task
  const handleGoToTask = useCallback(() => {
    router.push(`/projects/${file.project.id}?task=${file.task.id}`);
  }, [router, file.project.id, file.task.id]);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg group hover:border-gray-300 transition-colors',
        className
      )}
    >
      {/* File icon */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg">
        {getFileIcon(file.mimeType)}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.originalName}
        </p>
        <p className="text-xs text-gray-500">
          Task: {file.task.title}
        </p>
        <p className="text-xs text-gray-400">
          {formatFileSize(file.size)} &middot; Uploaded by {file.uploadedBy.name} &middot; {timeAgo}
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
            title="Preview"
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
          title="Download"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>

        {/* Go to task button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleGoToTask}
          title="Go to task"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Skeleton variant for loading state
 */
FileListItem.Skeleton = function FileListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  );
};

export default FileListItem;
