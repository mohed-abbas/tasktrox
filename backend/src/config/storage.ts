/**
 * Cloudflare R2 Storage Configuration
 *
 * R2 is S3-compatible, so we use the AWS SDK.
 * Provides file upload/download capabilities for attachments.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env.js';

// Check if R2 is configured
export const isStorageConfigured = !!(
  env.R2_ACCOUNT_ID &&
  env.R2_ACCESS_KEY_ID &&
  env.R2_SECRET_ACCESS_KEY
);

// Create S3 client for R2 (null if not configured)
export const r2Client = isStorageConfigured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

// Bucket name
export const R2_BUCKET = env.R2_BUCKET_NAME;

// Public URL for accessing files (if configured)
export const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

// Storage configuration
export const storageConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    'text/plain',
    'text/csv',
    'text/markdown',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/gzip',
    // Code
    'application/json',
    'application/javascript',
    'text/javascript',
    'text/html',
    'text/css',
  ],
  // File extension to MIME type mapping
  extensionToMime: {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.md': 'text/markdown',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.gz': 'application/gzip',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
  } as Record<string, string>,
};

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<boolean> {
  if (!r2Client) {
    return false;
  }

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  if (!r2Client) {
    return false;
  }

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a signed URL for downloading a file
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  if (!r2Client) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch {
    return null;
  }
}

/**
 * Get the public URL for a file (if R2_PUBLIC_URL is configured)
 */
export function getPublicUrl(key: string): string | null {
  if (!R2_PUBLIC_URL) {
    return null;
  }
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Generate a storage key for a file
 */
export function generateStorageKey(
  projectId: string,
  taskId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `projects/${projectId}/tasks/${taskId}/${timestamp}-${safeName}`;
}
