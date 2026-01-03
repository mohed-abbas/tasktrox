/**
 * File Upload Middleware (Multer)
 *
 * Handles multipart file uploads with validation.
 * Files are stored in memory before being uploaded to R2.
 */

import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { storageConfig } from '../config/storage.js';

// File filter to validate file types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (storageConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  // Check extension as fallback
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeFromExt = storageConfig.extensionToMime[ext];
  if (mimeFromExt && storageConfig.allowedMimeTypes.includes(mimeFromExt)) {
    cb(null, true);
    return;
  }

  cb(new Error(`File type not allowed: ${file.mimetype}`));
};

// Memory storage (files stored in buffer before upload to R2)
const storage = multer.memoryStorage();

// Create multer instance with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: storageConfig.maxFileSize,
    files: 5, // Max 5 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple file uploads
export const uploadMultiple = upload.array('files', 5);

// Error handler for multer errors
export function handleUploadError(error: Error): {
  code: string;
  message: string;
} {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds maximum allowed size of ${storageConfig.maxFileSize / 1024 / 1024}MB`,
        };
      case 'LIMIT_FILE_COUNT':
        return {
          code: 'TOO_MANY_FILES',
          message: 'Too many files. Maximum 5 files allowed per upload.',
        };
      case 'LIMIT_UNEXPECTED_FILE':
        return {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field name',
        };
      default:
        return {
          code: 'UPLOAD_ERROR',
          message: error.message,
        };
    }
  }

  if (error.message.includes('File type not allowed')) {
    return {
      code: 'INVALID_FILE_TYPE',
      message: error.message,
    };
  }

  return {
    code: 'UPLOAD_ERROR',
    message: 'An error occurred during file upload',
  };
}
