import api from '../axios';

// Types
export interface Activity {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  projectId: string;
  taskId: string | null;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  task?: {
    id: string;
    title: string;
  } | null;
}

export interface PaginationMeta {
  total?: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

interface ActivitiesResponse {
  activities: Activity[];
}

export interface GetActivitiesParams {
  limit?: number;
  offset?: number;
}

// ============ PROJECT ACTIVITIES API ============

/**
 * Get activities for a project with pagination
 */
export async function getProjectActivities(
  projectId: string,
  params: GetActivitiesParams = {}
): Promise<{ activities: Activity[]; meta: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const response = await api.get<ApiResponse<ActivitiesResponse>>(
    `/projects/${projectId}/activities?${queryParams.toString()}`
  );
  return {
    activities: response.data.data.activities,
    meta: response.data.meta || { limit: 20, offset: 0, hasMore: false },
  };
}

/**
 * Get activities for a specific task
 */
export async function getTaskActivities(
  projectId: string,
  taskId: string,
  params: GetActivitiesParams = {}
): Promise<{ activities: Activity[]; meta: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const response = await api.get<ApiResponse<ActivitiesResponse>>(
    `/projects/${projectId}/tasks/${taskId}/activities?${queryParams.toString()}`
  );
  return {
    activities: response.data.data.activities,
    meta: response.data.meta || { limit: 20, offset: 0, hasMore: false },
  };
}

/**
 * Get recent activities for the current user across all projects
 */
export async function getUserActivities(
  params: GetActivitiesParams = {}
): Promise<{ activities: Activity[]; meta: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const response = await api.get<ApiResponse<ActivitiesResponse>>(
    `/activities/me?${queryParams.toString()}`
  );
  return {
    activities: response.data.data.activities,
    meta: response.data.meta || { limit: 20, offset: 0, hasMore: false },
  };
}
