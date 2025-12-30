import api from '../axios';

// Types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  order: number;
  columnId: string;
  projectId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  labels?: { id: string; name: string; color: string }[];
  assignees?: { id: string; name: string; avatar: string | null }[];
  _count?: { comments: number; attachments: number };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  order?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  dueDate?: string | null;
}

export interface MoveTaskInput {
  targetColumnId: string;
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

interface TaskResponse {
  task: Task;
}

interface TasksResponse {
  tasks: Task[];
}

// ============ TASK API ============

/**
 * Get all tasks for a project
 */
export async function getTasks(projectId: string): Promise<Task[]> {
  const response = await api.get<ApiResponse<TasksResponse>>(
    `/projects/${projectId}/tasks`
  );
  return response.data.data.tasks;
}

/**
 * Get tasks for a specific column
 */
export async function getColumnTasks(
  projectId: string,
  columnId: string
): Promise<Task[]> {
  const response = await api.get<ApiResponse<TasksResponse>>(
    `/projects/${projectId}/columns/${columnId}/tasks`
  );
  return response.data.data.tasks;
}

/**
 * Get a single task by ID
 */
export async function getTask(projectId: string, taskId: string): Promise<Task> {
  const response = await api.get<ApiResponse<TaskResponse>>(
    `/projects/${projectId}/tasks/${taskId}`
  );
  return response.data.data.task;
}

/**
 * Create a new task
 */
export async function createTask(
  projectId: string,
  data: CreateTaskInput
): Promise<Task> {
  const response = await api.post<ApiResponse<TaskResponse>>(
    `/projects/${projectId}/tasks`,
    data
  );
  return response.data.data.task;
}

/**
 * Update a task
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  data: UpdateTaskInput
): Promise<Task> {
  const response = await api.patch<ApiResponse<TaskResponse>>(
    `/projects/${projectId}/tasks/${taskId}`,
    data
  );
  return response.data.data.task;
}

/**
 * Delete a task
 */
export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}

/**
 * Move a task to a new column and/or position
 */
export async function moveTask(
  projectId: string,
  taskId: string,
  data: MoveTaskInput
): Promise<Task> {
  const response = await api.patch<ApiResponse<TaskResponse>>(
    `/projects/${projectId}/tasks/${taskId}/move`,
    data
  );
  return response.data.data.task;
}
