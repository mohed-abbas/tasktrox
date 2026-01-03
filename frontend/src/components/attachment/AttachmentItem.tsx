'use client';

import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Attachment } from '@/lib/api/attachments';
import { formatFileSize, isImageFile, getFileExtension } from '@/lib/api/attachments';

interface AttachmentItemProps {
  attachment: Attachment;
  downloadUrl: string;
  onDelete?: (attachmentId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

/**
 * Get icon for file type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <Image className="w-8 h-8 text-blue-500" />;
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
  downloadUrl,
  onDelete,
  isDeleting = false,
  className,
}: AttachmentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(attachment.createdAt), {
    addSuffix: true,
  });

  const isImage = isImageFile(attachment.mimeType);
  const extension = getFileExtension(attachment.mimeType).toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors',
        className
      )}
    >
      {/* File icon or preview */}
      <div className="flex-shrink-0">
        {isImage ? (
          <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
            <img
              src={downloadUrl}
              alt={attachment.originalName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = 'none';
              }}
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          asChild
        >
          <a href={downloadUrl} download={attachment.originalName} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4" />
          </a>
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
