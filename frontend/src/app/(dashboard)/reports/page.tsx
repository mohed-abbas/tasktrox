'use client';

import { useState } from 'react';
import { BarChart3, Calendar, FolderKanban } from 'lucide-react';
import { useProjects } from '@/hooks';
import { useProjectReports } from '@/hooks/useReports';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TasksOverTimeChart,
  TasksByStatusChart,
  TasksByAssigneeChart,
  TasksByPriorityChart,
  CompletionMetricsCard,
} from '@/components/reports';

const TIME_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '90', label: 'Last 90 days' },
];

export default function ReportsPage() {
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [timeRange, setTimeRange] = useState('30');

  // Auto-select first project if none selected
  const projectId = selectedProjectId || projects[0]?.id;

  const {
    tasksOverTime,
    tasksByStatus,
    tasksByAssignee,
    tasksByPriority,
    completionMetrics,
    isLoading,
  } = useProjectReports(projectId, parseInt(timeRange));

  if (isLoadingProjects) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-[120px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Analyze project performance and team productivity
          </p>
        </div>

        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <FolderKanban className="size-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No projects found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Create a project first to see reports and analytics. Reports will show task progress,
              team workload, and completion metrics.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Analyze project performance and team productivity
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <FolderKanban className="size-4 text-gray-400" />
            <Select
              value={projectId}
              onValueChange={(value) => setSelectedProjectId(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-400" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Completion Metrics */}
      <CompletionMetricsCard data={completionMetrics.data} isLoading={completionMetrics.isLoading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Over Time */}
        <div className="lg:col-span-2">
          <TasksOverTimeChart data={tasksOverTime.data} isLoading={tasksOverTime.isLoading} />
        </div>

        {/* Tasks by Status */}
        <TasksByStatusChart data={tasksByStatus.data} isLoading={tasksByStatus.isLoading} />

        {/* Tasks by Priority */}
        <TasksByPriorityChart data={tasksByPriority.data} isLoading={tasksByPriority.isLoading} />

        {/* Tasks by Assignee */}
        <div className="lg:col-span-2">
          <TasksByAssigneeChart data={tasksByAssignee.data} isLoading={tasksByAssignee.isLoading} />
        </div>
      </div>

      {/* Empty State for No Data */}
      {!isLoading &&
        !tasksOverTime.data?.length &&
        !tasksByStatus.data?.some((s) => s.count > 0) && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-gray-100 rounded-full mb-4">
                <BarChart3 className="size-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-800 mb-1">No data available yet</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Start creating tasks in this project to see analytics and reports. Charts will
                update automatically as you work.
              </p>
            </div>
          </Card>
        )}
    </div>
  );
}
