'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Settings, LayoutGrid, List, Columns3, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProject, type Project } from '@/lib/api/projects';
import { Board, type Task, type ColumnWithTasks } from '@/components/board';

type ViewMode = 'board' | 'list' | 'grid';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  // Fetch project data
  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
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

  const columns = project.columns || [];

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Project Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-base font-semibold text-gray-800">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'board'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              title="Board View"
            >
              <Columns3 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              title="List View"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {/* Settings Link */}
          <Link
            href={`/projects/${projectId}/settings`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Project Settings"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </div>

      {/* Board View */}
      <div className="flex-1 overflow-x-auto p-4">
        <Board
          columns={columns.map((col) => ({ ...col, tasks: [] })) as ColumnWithTasks[]}
          projectId={projectId}
          onAddTask={(columnId, title) => {
            // TODO: Implement API call (Phase 3.7)
            console.log('Add task to column:', columnId, 'with title:', title);
          }}
          onAddColumn={() => {
            // TODO: Implement add column (Phase 3.6.5)
            console.log('Add column');
          }}
          onEditColumn={(columnId, name) => {
            // TODO: Implement edit column (Phase 3.6.3)
            console.log('Edit column:', columnId, name);
          }}
          onDeleteColumn={(columnId) => {
            // TODO: Implement delete column (Phase 3.6.5)
            console.log('Delete column:', columnId);
          }}
          onTaskClick={(task) => {
            // TODO: Implement task detail modal (Phase 3.7)
            console.log('Task clicked:', task);
          }}
        />
      </div>
    </div>
  );
}
