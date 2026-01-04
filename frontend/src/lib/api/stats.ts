import api from '../axios';

// Types
export interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface ProjectBreakdown {
  projectId: string;
  projectName: string;
  taskCount: number;
  completedCount: number;
  completionRate: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  projectBreakdown: ProjectBreakdown[];
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: string | null;
  projectId: string;
  projectName: string;
  columnName: string;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  taskId: string | null;
  projectId: string;
  projectName: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  tasks: TaskStats;
  projects: ProjectStats;
  upcomingTasks: UpcomingTask[];
  recentActivity: RecentActivityItem[];
}

export interface SingleProjectStats {
  tasks: TaskStats;
  upcomingTasks: UpcomingTask[];
  recentActivity: RecentActivityItem[];
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

interface DashboardStatsResponse {
  stats: DashboardStats;
}

interface ProjectStatsResponse {
  stats: SingleProjectStats;
}

// ============ STATS API ============

/**
 * Get dashboard stats for the current user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStatsResponse>>('/stats/dashboard');
  return response.data.data.stats;
}

/**
 * Get stats for a specific project
 */
export async function getProjectStats(projectId: string): Promise<SingleProjectStats> {
  const response = await api.get<ApiResponse<ProjectStatsResponse>>(
    `/stats/projects/${projectId}`
  );
  return response.data.data.stats;
}
