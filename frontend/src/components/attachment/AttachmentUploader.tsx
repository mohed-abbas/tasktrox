'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

interface AttachmentUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  error?: Error | null;
  maxSizeMB?: number;
  className?: string;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
];

/**
 * AttachmentUploader - Drag and drop file upload component
 */
export function AttachmentUploader({
  onUpload,
  isUploading = false,
  error,
  maxSizeMB = 10,
  className,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File size exceeds ${maxSizeMB}MB limit`;
      }

      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return 'File type not allowed';
      }

      return null;
    },
    [maxSizeMB]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null);
      const validationError = validateFile(file);

      if (validationError) {
        setLocalError(validationError);
        return;
      }

      try {
        await onUpload(file);
      } catch {
        // Error will be handled by parent through error prop
      }
    },
    [onUpload, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input value to allow re-uploading same file
      e.target.value = '';
    },
    [handleFile]
  );

  const displayError = localError || error?.message;

  return (
    <div className={className}>
      <label
        className={cn(
          'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',
          isUploading && 'pointer-events-none opacity-60'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 mb-2 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept={ALLOWED_TYPES.join(',')}
        />
      </label>

      {/* Error display */}
      {displayError && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

export default AttachmentUploader;
