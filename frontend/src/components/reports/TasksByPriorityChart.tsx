'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TasksByPriorityData } from '@/lib/api/reports';

interface TasksByPriorityChartProps {
  data: TasksByPriorityData[] | undefined;
  isLoading: boolean;
}

// Priority colors
const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ef4444', // red-500
  HIGH: '#f97316', // orange-500
  MEDIUM: '#f59e0b', // amber-500
  LOW: '#22c55e', // green-500
  None: '#94a3b8', // slate-400
};

interface ChartDataItem {
  priority: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

export function TasksByPriorityChart({ data, isLoading }: TasksByPriorityChartProps) {
  const chartData = useMemo((): ChartDataItem[] => {
    if (!data) return [];
    return data
      .filter((item) => item.count > 0)
      .map((item) => ({
        priority: item.priority,
        count: item.count,
        percentage: item.percentage,
      }));
  }, [data]);

  const getColor = (priority: string) => {
    return PRIORITY_COLORS[priority] || '#94a3b8';
  };

  const formatPriority = (priority: string) => {
    if (priority === 'None') return 'No Priority';
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Priority</CardTitle>
          <CardDescription>Priority distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Priority</CardTitle>
          <CardDescription>Priority distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No tasks to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by Priority</CardTitle>
        <CardDescription>Current priority distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="priority"
                label={({ payload, percent }) => {
                  const priority = (payload as ChartDataItem)?.priority ?? '';
                  return `${formatPriority(priority)} (${Math.round((percent ?? 0) * 100)}%)`;
                }}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.priority}`} fill={getColor(entry.priority)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  `${value} tasks`,
                  formatPriority(String(name)),
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{formatPriority(value)}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
