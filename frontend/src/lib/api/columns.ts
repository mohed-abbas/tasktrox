import api from '../axios';

// Types
export interface Column {
  id: string;
  name: string;
  order: number;
  color: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnInput {
  name: string;
  order?: number;
  color?: string;
}

export interface UpdateColumnInput {
  name?: string;
  order?: number;
  color?: string;
}

export interface ReorderColumnInput {
  order: number;
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

interface ColumnResponse {
  column: Column;
}

interface ColumnsResponse {
  columns: Column[];
}

// ============ COLUMN API ============

/**
 * Get all columns for a project
 */
export async function getColumns(projectId: string): Promise<Column[]> {
  const response = await api.get<ApiResponse<ColumnsResponse>>(
    `/projects/${projectId}/columns`
  );
  return response.data.data.columns;
}

/**
 * Create a new column
 */
export async function createColumn(
  projectId: string,
  data: CreateColumnInput
): Promise<Column> {
  const response = await api.post<ApiResponse<ColumnResponse>>(
    `/projects/${projectId}/columns`,
    data
  );
  return response.data.data.column;
}

/**
 * Update a column
 */
export async function updateColumn(
  projectId: string,
  columnId: string,
  data: UpdateColumnInput
): Promise<Column> {
  const response = await api.patch<ApiResponse<ColumnResponse>>(
    `/projects/${projectId}/columns/${columnId}`,
    data
  );
  return response.data.data.column;
}

/**
 * Delete a column
 */
export async function deleteColumn(
  projectId: string,
  columnId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/columns/${columnId}`);
}

/**
 * Reorder a column (move to new position)
 */
export async function reorderColumn(
  projectId: string,
  columnId: string,
  newOrder: number
): Promise<Column> {
  const response = await api.patch<ApiResponse<ColumnResponse>>(
    `/projects/${projectId}/columns/${columnId}/reorder`,
    { order: newOrder }
  );
  return response.data.data.column;
}
