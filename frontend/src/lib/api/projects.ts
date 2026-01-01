import api from '../axios';

// Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  columns?: Column[];
  members?: ProjectMember[];
  _count?: {
    members: number;
  };
}

export interface Column {
  id: string;
  name: string;
  order: number;
  color: string | null;
  projectId: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

// API Response wrappers
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

interface ProjectsResponse {
  projects: Project[];
}

interface ProjectResponse {
  project: Project;
}

// ============ PROJECT API ============

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  const response = await api.get<ApiResponse<ProjectsResponse>>('/projects');
  return response.data.data.projects;
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await api.get<ApiResponse<ProjectResponse>>(`/projects/${projectId}`);
  return response.data.data.project;
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectInput): Promise<Project> {
  const response = await api.post<ApiResponse<ProjectResponse>>('/projects', data);
  return response.data.data.project;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectInput
): Promise<Project> {
  const response = await api.patch<ApiResponse<ProjectResponse>>(`/projects/${projectId}`, data);
  return response.data.data.project;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}

// ============ MEMBER API ============

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const response = await api.get<ApiResponse<{ members: ProjectMember[] }>>(
    `/projects/${projectId}/members`
  );
  return response.data.data.members;
}

/**
 * Add a member to project
 */
export async function addProjectMember(
  projectId: string,
  email: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER'
): Promise<ProjectMember> {
  const response = await api.post<ApiResponse<{ member: ProjectMember }>>(
    `/projects/${projectId}/members`,
    { email, role }
  );
  return response.data.data.member;
}

/**
 * Update member role
 */
export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
): Promise<ProjectMember> {
  const response = await api.patch<ApiResponse<{ member: ProjectMember }>>(
    `/projects/${projectId}/members/${userId}`,
    { role }
  );
  return response.data.data.member;
}

/**
 * Remove a member from project
 */
export async function removeMember(projectId: string, userId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}
