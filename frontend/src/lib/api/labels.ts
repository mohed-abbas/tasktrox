import api from '../axios';

// Types
export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface CreateLabelInput {
  name: string;
  color: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
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

interface LabelResponse {
  label: Label;
}

interface LabelsResponse {
  labels: Label[];
}

// ============ PROJECT LABEL API ============

/**
 * Get all labels for a project
 */
export async function getProjectLabels(projectId: string): Promise<Label[]> {
  const response = await api.get<ApiResponse<LabelsResponse>>(
    `/projects/${projectId}/labels`
  );
  return response.data.data.labels;
}

/**
 * Get a single label by ID
 */
export async function getLabel(projectId: string, labelId: string): Promise<Label> {
  const response = await api.get<ApiResponse<LabelResponse>>(
    `/projects/${projectId}/labels/${labelId}`
  );
  return response.data.data.label;
}

/**
 * Create a new label
 */
export async function createLabel(
  projectId: string,
  data: CreateLabelInput
): Promise<Label> {
  const response = await api.post<ApiResponse<LabelResponse>>(
    `/projects/${projectId}/labels`,
    data
  );
  return response.data.data.label;
}

/**
 * Update a label
 */
export async function updateLabel(
  projectId: string,
  labelId: string,
  data: UpdateLabelInput
): Promise<Label> {
  const response = await api.patch<ApiResponse<LabelResponse>>(
    `/projects/${projectId}/labels/${labelId}`,
    data
  );
  return response.data.data.label;
}

/**
 * Delete a label
 */
export async function deleteLabel(projectId: string, labelId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/labels/${labelId}`);
}

// ============ TASK LABEL API ============

/**
 * Get all labels for a task
 */
export async function getTaskLabels(
  projectId: string,
  taskId: string
): Promise<Label[]> {
  const response = await api.get<ApiResponse<LabelsResponse>>(
    `/projects/${projectId}/tasks/${taskId}/labels`
  );
  return response.data.data.labels;
}

/**
 * Add a label to a task
 */
export async function addLabelToTask(
  projectId: string,
  taskId: string,
  labelId: string
): Promise<void> {
  await api.post(`/projects/${projectId}/tasks/${taskId}/labels`, { labelId });
}

/**
 * Remove a label from a task
 */
export async function removeLabelFromTask(
  projectId: string,
  taskId: string,
  labelId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/tasks/${taskId}/labels/${labelId}`);
}

/**
 * Set all labels for a task (replaces existing)
 */
export async function setTaskLabels(
  projectId: string,
  taskId: string,
  labelIds: string[]
): Promise<Label[]> {
  const response = await api.put<ApiResponse<LabelsResponse>>(
    `/projects/${projectId}/tasks/${taskId}/labels`,
    { labelIds }
  );
  return response.data.data.labels;
}
