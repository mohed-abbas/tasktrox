'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TasksByStatusData } from '@/lib/api/reports';

interface TasksByStatusChartProps {
  data: TasksByStatusData[] | undefined;
  isLoading: boolean;
}

// Status colors matching the board columns
const STATUS_COLORS: Record<string, string> = {
  Backlog: '#94a3b8', // slate-400
  'To Do': '#3b82f6', // blue-500
  'In Progress': '#f59e0b', // amber-500
  Review: '#8b5cf6', // violet-500
  Done: '#22c55e', // green-500
};

const DEFAULT_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
];

interface ChartDataItem {
  status: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

export function TasksByStatusChart({ data, isLoading }: TasksByStatusChartProps) {
  const chartData = useMemo((): ChartDataItem[] => {
    if (!data) return [];
    return data
      .filter((item) => item.count > 0)
      .map((item) => ({
        status: item.status,
        count: item.count,
        percentage: item.percentage,
      }));
  }, [data]);

  const getColor = (status: string, index: number) => {
    return STATUS_COLORS[status] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Status</CardTitle>
          <CardDescription>Distribution across columns</CardDescription>
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
          <CardTitle>Tasks by Status</CardTitle>
          <CardDescription>Distribution across columns</CardDescription>
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
        <CardTitle>Tasks by Status</CardTitle>
        <CardDescription>Current distribution across columns</CardDescription>
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
                nameKey="status"
                label={({ payload, percent }) => {
                  const status = (payload as ChartDataItem)?.status ?? '';
                  return `${status} (${Math.round((percent ?? 0) * 100)}%)`;
                }}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.status}`} fill={getColor(entry.status, index)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [`${value} tasks`, String(name)]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
