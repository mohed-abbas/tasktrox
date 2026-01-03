import api from '../axios';

// Types
export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  taskId: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

interface AttachmentsResponse {
  attachments: Attachment[];
}

interface AttachmentResponse {
  attachment: Attachment;
}

// ============ ATTACHMENT API ============

/**
 * Get all attachments for a task
 */
export async function getTaskAttachments(
  projectId: string,
  taskId: string
): Promise<Attachment[]> {
  const response = await api.get<ApiResponse<AttachmentsResponse>>(
    `/projects/${projectId}/tasks/${taskId}/attachments`
  );
  return response.data.data.attachments;
}

/**
 * Upload an attachment to a task
 */
export async function uploadAttachment(
  projectId: string,
  taskId: string,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<AttachmentResponse>>(
    `/projects/${projectId}/tasks/${taskId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data.attachment;
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(
  projectId: string,
  attachmentId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/attachments/${attachmentId}`);
}

/**
 * Get download URL for an attachment (redirects to signed URL)
 */
export function getAttachmentDownloadUrl(attachmentId: string): string {
  return `${api.defaults.baseURL}/attachments/${attachmentId}/download`;
}

/**
 * Helper to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file type is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/json': 'json',
    'application/zip': 'zip',
  };
  return extensions[mimeType] || 'file';
}
