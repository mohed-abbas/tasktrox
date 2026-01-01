import api from '../axios';

// Types
export interface Assignee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  assignedAt?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
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

interface AssigneesResponse {
  assignees: Assignee[];
}

interface AssigneeResponse {
  assignee: Assignee;
}

interface MembersResponse {
  members: ProjectMember[];
}

// ============ ASSIGNEE API ============

/**
 * Get all assignees for a task
 */
export async function getTaskAssignees(
  projectId: string,
  taskId: string
): Promise<Assignee[]> {
  const response = await api.get<ApiResponse<AssigneesResponse>>(
    `/projects/${projectId}/tasks/${taskId}/assignees`
  );
  return response.data.data.assignees;
}

/**
 * Add an assignee to a task
 */
export async function addAssignee(
  projectId: string,
  taskId: string,
  userId: string
): Promise<Assignee> {
  const response = await api.post<ApiResponse<AssigneeResponse>>(
    `/projects/${projectId}/tasks/${taskId}/assignees`,
    { userId }
  );
  return response.data.data.assignee;
}

/**
 * Remove an assignee from a task
 */
export async function removeAssignee(
  projectId: string,
  taskId: string,
  userId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/tasks/${taskId}/assignees/${userId}`);
}

/**
 * Set all assignees for a task (replace)
 */
export async function setTaskAssignees(
  projectId: string,
  taskId: string,
  userIds: string[]
): Promise<Assignee[]> {
  const response = await api.put<ApiResponse<AssigneesResponse>>(
    `/projects/${projectId}/tasks/${taskId}/assignees`,
    { userIds }
  );
  return response.data.data.assignees;
}

/**
 * Get all project members available for assignment
 */
export async function getAssignableMembers(
  projectId: string
): Promise<ProjectMember[]> {
  const response = await api.get<ApiResponse<MembersResponse>>(
    `/projects/${projectId}/members/assignable`
  );
  return response.data.data.members;
}
