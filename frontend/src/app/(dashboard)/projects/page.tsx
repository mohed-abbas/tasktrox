'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';
import { ProjectCard, NewProjectModal } from '@/components/project';
import { getProjects, createProject, type Project } from '@/lib/api/projects';

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
    },
  });

  const handleCreateProject = async (data: { name: string; description: string }) => {
    await createMutation.mutateAsync(data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card border border-gray-200">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <FolderKanban className="size-8 text-red-400" />
        </div>
        <h3 className="text-base font-medium text-gray-800 mb-1">
          Failed to load projects
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
          className="btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and organize your projects
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description ?? undefined}
              taskCount={0} // Tasks not loaded yet
              memberCount={project._count?.members ?? 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card border border-gray-200">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <FolderKanban className="size-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first project to get started
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Create Project
          </button>
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
