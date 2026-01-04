'use client';

import { use, useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, Settings, LogOut } from 'lucide-react';
import { ViewNav, type ViewType } from '@/components/app';
import { getProject, type Project } from '@/lib/api/projects';
import { Board, type Task, type ColumnWithTasks } from '@/components/board';
import { ListView, GridView } from '@/components/views';
import { TaskDetailModal } from '@/components/task';
import { toast } from 'sonner';
import { useColumns, useTasks, useTask, useLabels, useViewPreference, useProjectMembers, useAuth, useFilters, type ViewMode } from '@/hooks';
import { setTaskLabels } from '@/lib/api/labels';
import { FilterPanel } from '@/components/filter';
import { useSocket } from '@/providers/SocketProvider';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Socket connection for real-time updates
  const { joinProject, leaveProject, isConnected } = useSocket();

  // Join project room for real-time updates
  useEffect(() => {
    if (isConnected && projectId) {
      joinProject(projectId);
    }

    return () => {
      if (isConnected && projectId) {
        leaveProject(projectId);
      }
    };
  }, [projectId, isConnected, joinProject, leaveProject]);

  // View preference with localStorage persistence
  const { viewMode, setViewMode } = useViewPreference({ projectId });

  // Get current user
  const { user } = useAuth();

  // Get user's role and permissions for this project
  const {
    members: projectMembers,
    canEditTasks,
    canAccessSettings,
    isViewer,
    removeMember,
    isRemoving,
  } = useProjectMembers({ projectId });

  // Filter state management
  const {
    filters,
    setFilters,
    filterTasks,
    hasActiveFilters,
  } = useFilters();

  // Leave project handler (for viewers)
  const handleLeaveProject = useCallback(async () => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to leave this project?')) return;

    try {
      await removeMember(user.id);
      router.push('/projects');
    } catch {
      // Error toast is handled by the mutation
    }
  }, [user?.id, removeMember, router]);

  // Task detail modal state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch project data
  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  });

  // Column operations with optimistic updates
  const {
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
  } = useColumns({ projectId });

  // Task operations with optimistic updates
  const {
    tasksByColumn,
    isLoadingTasks,
    createTask,
    moveTask,
    updateTask: updateTaskFromList,
    deleteTask: _deleteTaskFromList,
  } = useTasks({ projectId });

  // Single task operations for the modal
  const {
    task: selectedTask,
    isLoading: isLoadingTask,
    updateTask,
    deleteTask,
  } = useTask({
    projectId,
    taskId: selectedTaskId,
    enabled: isModalOpen && !!selectedTaskId,
  });

  // Labels for the project
  const {
    labels: projectLabels,
    createLabel,
  } = useLabels({ projectId });

  // Handle task click - open modal
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  }, []);

  // Handle task completion toggle
  const handleToggleComplete = useCallback((taskId: string, completed: boolean) => {
    updateTaskFromList({
      taskId,
      data: { completed },
    });
  }, [updateTaskFromList]);

  // Handle modal close
  const handleModalClose = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Delay clearing selected task to allow exit animation
      setTimeout(() => setSelectedTaskId(null), 200);
    }
  }, []);

  // Handle task update from modal
  const handleTaskUpdate = useCallback((taskId: string, data: Partial<Task>) => {
    // Convert to UpdateTaskInput format
    updateTask({
      title: data.title,
      description: data.description ?? undefined,
      priority: data.priority ?? undefined,
      dueDate: data.dueDate ?? undefined,
    });
  }, [updateTask]);

  // Handle task delete from modal
  const handleTaskDelete = useCallback((_taskId: string) => {
    deleteTask();
  }, [deleteTask]);

  // Handle labels change for a task
  const handleLabelsChange = useCallback(async (taskId: string, labelIds: string[]) => {
    try {
      await setTaskLabels(projectId, taskId, labelIds);
      // Invalidate queries to refresh labels
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Labels updated');
    } catch (error) {
      console.error('Failed to update labels:', error);
      toast.error('Failed to update labels', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  }, [projectId, queryClient]);

  // Handle creating a new label from the task modal
  const handleCreateLabel = useCallback(async (name: string, color: string) => {
    return await createLabel({ name, color });
  }, [createLabel]);

  // Transform project members for FilterPanel
  const filterMembers = useMemo(() =>
    projectMembers.map(m => ({
      id: m.user.id,
      name: m.user.name,
      avatar: m.user.avatar,
    }))
  , [projectMembers]);

  // Apply filters and search to tasks
  const filteredTasksByColumn = useMemo(() => {
    const result: Record<string, Task[]> = {};

    for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
      // Apply filter criteria (priority, labels, assignees, dueDate)
      let filtered = filterTasks(tasks);

      // Apply text search on title and description
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        );
      }

      result[columnId] = filtered;
    }

    return result;
  }, [tasksByColumn, filterTasks, searchQuery]);

  // Combine columns with their filtered tasks for the Board component
  // Must be called before any early returns (Rules of Hooks)
  const columns = project?.columns || [];
  const columnsWithTasks: ColumnWithTasks[] = useMemo(() => {
    return columns
      .map((col) => ({
        ...col,
        tasks: (filteredTasksByColumn[col.id] || []) as Task[],
      }))
      .sort((a, b) => a.order - b.order);
  }, [columns, filteredTasksByColumn]);

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

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Project Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 leading-tight truncate max-w-[200px] sm:max-w-[300px] lg:max-w-none">
          {project.name}
        </h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Admin/Member: Settings */}
          {canAccessSettings ? (
            <Link
              href={`/projects/${projectId}/settings`}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Project Settings"
            >
              <Settings size={20} />
            </Link>
          ) : isViewer ? (
            /* Viewer: Leave Project */
            <button
              type="button"
              onClick={handleLeaveProject}
              disabled={isRemoving}
              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Leave Project"
            >
              {isRemoving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogOut size={20} />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* View Navigation Bar */}
      <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
        <ViewNav
          activeView={viewMode as ViewType}
          onViewChange={(view) => setViewMode(view as ViewMode)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Filter Panel - shown when filter is open */}
      {isFilterOpen && (
        <div className="px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            labels={projectLabels}
            members={filterMembers}
          />
        </div>
      )}

      {/* View Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {viewMode === 'board' && (
          <Board
            columns={columnsWithTasks}
            projectId={projectId}
            isLoading={isLoadingTasks}
            readOnly={!canEditTasks}
            onAddTask={(columnId, title) => {
              createTask({
                title,
                columnId,
              });
            }}
            onAddColumn={(name) => {
              createColumn({
                name,
                order: columns.length,
              });
            }}
            onEditColumn={(columnId, name) => {
              updateColumn({
                columnId,
                data: { name },
              });
            }}
            onDeleteColumn={(columnId) => {
              deleteColumn(columnId);
            }}
            onTaskClick={handleTaskClick}
            onToggleComplete={canEditTasks ? handleToggleComplete : undefined}
            onMoveTask={(taskId, sourceColumnId, targetColumnId, newOrder) => {
              moveTask({
                taskId,
                sourceColumnId,
                data: {
                  targetColumnId: targetColumnId,
                  order: newOrder,
                },
              });
            }}
            onReorderColumn={(columnId, newOrder) => {
              reorderColumn({
                columnId,
                newOrder,
              });
            }}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            columns={columnsWithTasks}
            projectId={projectId}
            isLoading={isLoadingTasks}
            onTaskClick={handleTaskClick}
          />
        )}

        {viewMode === 'grid' && (
          <GridView
            columns={columnsWithTasks}
            projectId={projectId}
            isLoading={isLoadingTasks}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask || null}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onUpdate={canEditTasks ? handleTaskUpdate : undefined}
        onDelete={canEditTasks ? handleTaskDelete : undefined}
        onToggleComplete={canEditTasks ? handleToggleComplete : undefined}
        isLoading={isLoadingTask}
        projectLabels={projectLabels}
        onLabelsChange={canEditTasks ? handleLabelsChange : undefined}
        onCreateLabel={canEditTasks ? handleCreateLabel : undefined}
        projectId={projectId}
        readOnly={!canEditTasks}
      />
    </div>
  );
}
