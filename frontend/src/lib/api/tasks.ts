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
  completedAt: string | null;
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
  completed?: boolean;
}

export interface MoveTaskInput {
  targetColumnId: string;
  order: number;
}

// Global task type (includes project context)
export interface GlobalTask extends Task {
  project: {
    id: string;
    name: string;
    color: string;
  };
  column: {
    id: string;
    name: string;
    projectId: string;
  };
}

export interface GlobalTasksFilters {
  status?: 'active' | 'completed' | 'all';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId?: string;
  assignedToMe?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'project';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GlobalTasksResponse {
  tasks: GlobalTask[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
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

// ============ GLOBAL TASKS API ============

/**
 * Get all tasks for the authenticated user across all projects
 */
export async function getAllTasks(
  filters?: GlobalTasksFilters
): Promise<GlobalTasksResponse> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.assignedToMe) params.append('assignedToMe', 'true');
    if (filters.dueBefore) params.append('dueBefore', filters.dueBefore);
    if (filters.dueAfter) params.append('dueAfter', filters.dueAfter);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';

  const response = await api.get<ApiResponse<GlobalTasksResponse>>(url);
  return response.data.data;
}

/**
 * Mark a task as complete/incomplete (uses the project-scoped update endpoint)
 */
export async function toggleTaskComplete(
  projectId: string,
  taskId: string,
  completed: boolean
): Promise<Task> {
  return updateTask(projectId, taskId, { completed });
}
