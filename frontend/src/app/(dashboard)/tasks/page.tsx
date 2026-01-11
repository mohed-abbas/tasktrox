'use client';

import { useState, useMemo } from 'react';
import {
  ListTodo,
  Loader2,
  ChevronDown,
  ChevronRight,
  Filter,
  SortAsc,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAllTasks } from '@/hooks/useAllTasks';
import { useProjects } from '@/hooks/useProjects';
import { TaskListItem } from '@/components/tasks/TaskListItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GlobalTasksFilters } from '@/lib/api/tasks';

type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'project';
type SortOrder = 'asc' | 'desc';

const sortLabels: Record<SortOption, string> = {
  dueDate: 'Due Date',
  priority: 'Priority',
  createdAt: 'Created',
  project: 'Project',
};

export default function TasksPage() {
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [completedOpen, setCompletedOpen] = useState(false);

  // Build filters
  const filters: GlobalTasksFilters = useMemo(() => {
    const f: GlobalTasksFilters = {
      sortBy,
      sortOrder,
      limit: 100,
    };
    if (search) f.search = search;
    if (selectedPriority) f.priority = selectedPriority;
    if (selectedProjectId) f.projectId = selectedProjectId;
    return f;
  }, [search, selectedPriority, selectedProjectId, sortBy, sortOrder]);

  // Fetch tasks
  const {
    activeTasks,
    completedTasks,
    isLoading,
    isError,
    error,
    refetch,
    toggleComplete,
    isToggling,
  } = useAllTasks({ filters });

  // Fetch projects for filter dropdown
  const { projects } = useProjects();

  // Active filter count
  const activeFilterCount = [selectedPriority, selectedProjectId].filter(Boolean).length;

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedPriority(null);
    setSelectedProjectId(null);
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
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card border border-gray-200">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <ListTodo className="size-8 text-red-400" />
        </div>
        <h3 className="text-base font-medium text-gray-800 mb-1">
          Failed to load tasks
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">All Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage tasks from all your projects
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Priority
              {selectedPriority && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {selectedPriority}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setSelectedPriority(null)}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedPriority('HIGH')}>
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPriority('MEDIUM')}>
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPriority('LOW')}>
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Project Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              Project
              {selectedProjectId && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {projects?.find((p) => p.id === selectedProjectId)?.name || '1'}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem onClick={() => setSelectedProjectId(null)}>
              All Projects
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {projects?.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <SortAsc className="h-4 w-4" />
              {sortLabels[sortBy]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(sortLabels).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSortBy(key as SortOption)}
                className={cn(sortBy === key && 'bg-gray-100')}
              >
                {label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-gray-500"
          >
            Clear filters
            <X className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Task Lists */}
      <div className="space-y-4">
        {/* Active Tasks */}
        {activeTasks.length > 0 ? (
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                isToggling={isToggling}
                isCompleted={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-card border border-gray-200">
            <div className="p-4 bg-green-50 rounded-full mb-4">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            <h3 className="text-base font-medium text-gray-800 mb-1">
              {search || selectedPriority || selectedProjectId
                ? 'No tasks match your filters'
                : 'All caught up!'}
            </h3>
            <p className="text-sm text-gray-500">
              {search || selectedPriority || selectedProjectId
                ? 'Try adjusting your filters'
                : 'You have no active tasks across your projects'}
            </p>
          </div>
        )}

        {/* Completed Tasks Accordion */}
        {completedTasks.length > 0 && (
          <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 w-full p-3 text-left text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                {completedOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium">Completed</span>
                <Badge variant="secondary" className="ml-1">
                  {completedTasks.length}
                </Badge>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {completedTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  isToggling={isToggling}
                  isCompleted={true}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
