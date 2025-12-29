'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Settings, Plus, LayoutGrid, List, Columns3, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProject, type Project } from '@/lib/api/projects';

// Column colors mapping
const columnColors: Record<string, string> = {
  'To Do': 'bg-column-todo',
  'In Progress': 'bg-column-in-progress',
  'Review': 'bg-column-in-review',
  'Done': 'bg-column-completed',
};

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
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col w-[300px] bg-gray-50 rounded-xl"
            >
              {/* Column Header */}
              <div className="column-header">
                <div className="column-header-title">
                  <span className={cn('size-2 rounded-full', columnColors[column.name] || 'bg-gray-400')} />
                  <span>{column.name}</span>
                </div>
                <span className="column-header-count">0</span>
              </div>

              {/* Column Content - Empty for now, tasks will be added later */}
              <div className="flex-1 px-3 pb-3 space-y-2">
                {/* Add Task Button */}
                <button className="add-task-button">
                  <Plus className="size-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <button className="flex items-center justify-center gap-2 w-[300px] h-12 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 text-sm transition-colors">
            <Plus className="size-4" />
            Add Column
          </button>
        </div>
      </div>
    </div>
  );
}
