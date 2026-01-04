'use client';

import Link from 'next/link';
import { useAuth, useProjects } from '@/hooks';
import { useDashboardStats } from '@/hooks/useStats';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentActivity, UpcomingTasks } from '@/components/dashboard';
import {
  CheckSquare,
  FolderKanban,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  AlertTriangle,
} from 'lucide-react';

const MAX_DASHBOARD_PROJECTS = 6;

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();

  // Sort by updatedAt desc and take only the first 6
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_DASHBOARD_PROJECTS);

  const showViewAll = projects.length > MAX_DASHBOARD_PROJECTS;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-light rounded-lg">
                <CheckSquare className="size-5 text-info" />
              </div>
              <div>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.tasks.total ?? 0}
                  </p>
                )}
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-light rounded-lg">
                <Clock className="size-5 text-warning" />
              </div>
              <div>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.tasks.inProgress ?? 0}
                  </p>
                )}
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-light rounded-lg">
                <TrendingUp className="size-5 text-success" />
              </div>
              <div>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.tasks.completed ?? 0}
                  </p>
                )}
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-light rounded-lg">
                <AlertTriangle className="size-5 text-error" />
              </div>
              <div>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.tasks.overdue ?? 0}
                  </p>
                )}
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks
          tasks={stats?.upcomingTasks ?? []}
          isLoading={isLoadingStats}
        />
        <RecentActivity
          activities={stats?.recentActivity ?? []}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Your Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Your Projects</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
              <FolderKanban className="size-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                {isLoadingStats ? '...' : stats?.projects.activeProjects ?? projects.length}
              </span>
            </div>
          </div>
          {showViewAll && (
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              View All
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {isLoadingProjects ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          // Empty state
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-gray-100 rounded-full mb-4">
                <FolderKanban className="size-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-800 mb-1">
                No projects yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Create your first project to get started
              </p>
              <Link href="/projects" className="btn-primary flex items-center gap-1.5">
                <Plus className="size-4" />
                Create Project
              </Link>
            </div>
          </Card>
        ) : (
          // Projects grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => {
              // Find task count from stats breakdown if available
              const projectStats = stats?.projects.projectBreakdown.find(
                (p) => p.projectId === project.id
              );

              return (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description ?? undefined}
                  taskCount={projectStats?.taskCount ?? 0}
                  memberCount={project._count?.members ?? project.members?.length ?? 1}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
