'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react';
import { getProject, updateProject, deleteProject, type Project } from '@/lib/api/projects';
import { useLabels } from '@/hooks';
import { ManageLabels } from '@/components/labels';

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false);

  // Labels hook for project label management
  const {
    labels,
    isLoading: labelsLoading,
    createLabel,
    updateLabel,
    deleteLabel,
  } = useLabels({ projectId });

  // Fetch project data
  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  });

  // Populate form when project data loads
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      updateProject(projectId, data),
    onSuccess: (updatedProject) => {
      // Update cache
      queryClient.setQueryData(['project', projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/projects');
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({ name, description });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    await deleteMutation.mutateAsync();
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
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <AlertCircle className="size-8 text-red-400" />
        </div>
        <h3 className="text-base font-medium text-gray-800 mb-1">
          Failed to load project
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {error instanceof Error ? error.message : 'Project not found'}
        </p>
        <Link href="/projects" className="btn-secondary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${projectId}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Project Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your project configuration
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card">
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="project-description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input-base resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-card">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Labels Management */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Tag className="size-4" />
                Labels
              </h2>
              <p className="text-sm text-gray-500">
                Manage labels to organize and categorize your tasks.
                {labels.length > 0 && (
                  <span className="ml-1 text-gray-400">
                    ({labels.length} label{labels.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLabelsDialogOpen(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Tag className="size-4" />
              Manage Labels
            </button>
          </div>
        </div>
      </div>

      {/* ManageLabels Dialog */}
      <ManageLabels
        open={labelsDialogOpen}
        onOpenChange={setLabelsDialogOpen}
        labels={labels}
        onCreateLabel={createLabel}
        onUpdateLabel={updateLabel}
        onDeleteLabel={deleteLabel}
        isLoading={labelsLoading}
      />

      {/* Danger Zone */}
      <div className="bg-white rounded-card border border-red-200 shadow-card">
        <div className="p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete this project and all of its data.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-button text-sm font-medium transition-colors"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}
