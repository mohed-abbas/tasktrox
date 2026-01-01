import api from '../axios';

export interface TaskSearchResult {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  column: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  labels: { id: string; name: string; color: string }[];
  assignees: { id: string; name: string; avatar: string | null }[];
}

export interface ProjectSearchResult {
  id: string;
  name: string;
  description: string | null;
  _count: { tasks: number; columns: number };
}

export interface SearchResults {
  tasks: TaskSearchResult[];
  projects: ProjectSearchResult[];
}

export interface SearchParams {
  q: string;
  projectId?: string;
  limit?: number;
}

/**
 * Search tasks and projects.
 */
export async function search(params: SearchParams): Promise<SearchResults> {
  const { data } = await api.get('/search', { params });
  return data.data;
}
