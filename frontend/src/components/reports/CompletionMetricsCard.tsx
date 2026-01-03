'use client';

import { CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CompletionMetrics } from '@/lib/api/reports';

interface CompletionMetricsCardProps {
  data: CompletionMetrics | undefined;
  isLoading: boolean;
}

export function CompletionMetricsCard({ data, isLoading }: CompletionMetricsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completion Metrics</CardTitle>
          <CardDescription>Project performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completion Metrics</CardTitle>
          <CardDescription>Project performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            No metrics available
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Completion Rate',
      value: `${data.completionRate}%`,
      subtext: `${data.completedTasks} of ${data.totalTasks} tasks`,
      icon: CheckCircle2,
      color: data.completionRate >= 70 ? 'text-green-500' : 'text-amber-500',
    },
    {
      label: 'Overdue Rate',
      value: `${data.overdueRate}%`,
      subtext: 'of open tasks',
      icon: AlertTriangle,
      color: data.overdueRate > 20 ? 'text-red-500' : 'text-green-500',
    },
    {
      label: 'This Week',
      value: data.tasksCompletedThisWeek.toString(),
      subtext: 'tasks completed',
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: 'Week over Week',
      value: `${data.weekOverWeekChange > 0 ? '+' : ''}${data.weekOverWeekChange}%`,
      subtext: `vs ${data.tasksCompletedLastWeek} last week`,
      icon:
        data.weekOverWeekChange > 0
          ? TrendingUp
          : data.weekOverWeekChange < 0
            ? TrendingDown
            : Minus,
      color:
        data.weekOverWeekChange > 0
          ? 'text-green-500'
          : data.weekOverWeekChange < 0
            ? 'text-red-500'
            : 'text-muted-foreground',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Metrics</CardTitle>
        <CardDescription>Project performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className={cn('rounded-lg bg-muted p-2', metric.color)}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
