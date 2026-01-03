'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TasksByAssigneeData } from '@/lib/api/reports';

interface TasksByAssigneeChartProps {
  data: TasksByAssigneeData[] | undefined;
  isLoading: boolean;
}

export function TasksByAssigneeChart({ data, isLoading }: TasksByAssigneeChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: item.userName.split(' ')[0], // First name only for space
      fullName: item.userName,
      total: item.total,
      completed: item.completed,
      inProgress: item.inProgress,
      pending: item.total - item.completed - item.inProgress,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Assignee</CardTitle>
          <CardDescription>Workload distribution</CardDescription>
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
          <CardTitle>Tasks by Assignee</CardTitle>
          <CardDescription>Workload distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No assigned tasks to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by Assignee</CardTitle>
        <CardDescription>Workload distribution across team members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullName || label;
                }}
              />
              <Legend />
              <Bar dataKey="completed" name="Completed" fill="#22c55e" stackId="a" />
              <Bar dataKey="inProgress" name="In Progress" fill="#f59e0b" stackId="a" />
              <Bar dataKey="pending" name="Pending" fill="#94a3b8" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
