import api from '../axios';

// Types matching backend
export interface TasksOverTimeData {
  date: string;
  created: number;
  completed: number;
}

export interface TasksByStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface TasksByAssigneeData {
  userId: string;
  userName: string;
  avatar: string | null;
  total: number;
  completed: number;
  inProgress: number;
}

export interface TasksByPriorityData {
  priority: string;
  count: number;
  percentage: number;
}

export interface CompletionMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number | null;
  overdueRate: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  weekOverWeekChange: number;
}

// API functions
export async function getTasksOverTime(
  projectId: string,
  days: number = 30
): Promise<TasksOverTimeData[]> {
  const response = await api.get<{ success: boolean; data: { tasksOverTime: TasksOverTimeData[] } }>(
    `/projects/${projectId}/reports/tasks-over-time`,
    { params: { days } }
  );
  return response.data.data.tasksOverTime;
}

export async function getTasksByStatus(projectId: string): Promise<TasksByStatusData[]> {
  const response = await api.get<{ success: boolean; data: { tasksByStatus: TasksByStatusData[] } }>(
    `/projects/${projectId}/reports/tasks-by-status`
  );
  return response.data.data.tasksByStatus;
}

export async function getTasksByAssignee(projectId: string): Promise<TasksByAssigneeData[]> {
  const response = await api.get<{
    success: boolean;
    data: { tasksByAssignee: TasksByAssigneeData[] };
  }>(`/projects/${projectId}/reports/tasks-by-assignee`);
  return response.data.data.tasksByAssignee;
}

export async function getTasksByPriority(projectId: string): Promise<TasksByPriorityData[]> {
  const response = await api.get<{
    success: boolean;
    data: { tasksByPriority: TasksByPriorityData[] };
  }>(`/projects/${projectId}/reports/tasks-by-priority`);
  return response.data.data.tasksByPriority;
}

export async function getCompletionMetrics(projectId: string): Promise<CompletionMetrics> {
  const response = await api.get<{
    success: boolean;
    data: { completionMetrics: CompletionMetrics };
  }>(`/projects/${projectId}/reports/completion-metrics`);
  return response.data.data.completionMetrics;
}
