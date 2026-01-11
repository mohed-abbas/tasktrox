import api from '../axios';

// Types
export interface GlobalFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
  task: {
    id: string;
    title: string;
  };
  project: {
    id: string;
    name: string;
    color: string;
  };
}

export type FileTypeCategory = 'images' | 'documents' | 'spreadsheets' | 'archives' | 'other';

export interface GlobalFilesFilters {
  search?: string;
  type?: FileTypeCategory;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'size' | 'originalName';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GlobalFilesResponse {
  files: GlobalFile[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// File type options for filtering
export const FILE_TYPE_OPTIONS = [
  { value: null, label: 'All Types' },
  { value: 'images', label: 'Images' },
  { value: 'documents', label: 'Documents' },
  { value: 'spreadsheets', label: 'Spreadsheets' },
  { value: 'archives', label: 'Archives' },
  { value: 'other', label: 'Other' },
] as const;

// Date range options for filtering
export const DATE_RANGE_OPTIONS = [
  { value: null, label: 'All Time', days: null },
  { value: '7', label: 'Last 7 Days', days: 7 },
  { value: '30', label: 'Last 30 Days', days: 30 },
  { value: '90', label: 'Last 90 Days', days: 90 },
] as const;

// Sort options
export const SORT_OPTIONS = [
  { sortBy: 'createdAt', sortOrder: 'desc', label: 'Newest First' },
  { sortBy: 'createdAt', sortOrder: 'asc', label: 'Oldest First' },
  { sortBy: 'size', sortOrder: 'desc', label: 'Largest First' },
  { sortBy: 'size', sortOrder: 'asc', label: 'Smallest First' },
  { sortBy: 'originalName', sortOrder: 'asc', label: 'Name (A-Z)' },
  { sortBy: 'originalName', sortOrder: 'desc', label: 'Name (Z-A)' },
] as const;

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============ FILES API ============

/**
 * Get all files for the authenticated user across all projects
 */
export async function getAllFiles(
  filters?: GlobalFilesFilters
): Promise<GlobalFilesResponse> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/files?${queryString}` : '/files';

  const response = await api.get<ApiResponse<GlobalFilesResponse>>(url);
  return response.data.data;
}

/**
 * Get download URL for a file
 */
export async function getFileDownloadUrl(attachmentId: string): Promise<string> {
  const response = await api.get<ApiResponse<{ url: string }>>(
    `/attachments/${attachmentId}/download`
  );
  return response.data.data.url;
}
