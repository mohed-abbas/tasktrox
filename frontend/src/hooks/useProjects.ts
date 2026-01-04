'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProjects,
  createProject,
  deleteProject,
  type CreateProjectInput,
} from '@/lib/api/projects';

/**
 * Hook for fetching and managing user projects.
 * Provides query for projects list and mutations for create/delete.
 */
export function useProjects() {
  const queryClient = useQueryClient();

  // Query for fetching all projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 60 * 1000, // 1 minute
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create project', {
        description: error.message,
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete project', {
        description: error.message,
      });
    },
  });

  return {
    // Query state
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,

    // Mutations
    createProject: createProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}
