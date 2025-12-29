'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckSquare,
  FolderKanban,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

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
                <p className="text-2xl font-semibold text-gray-800">12</p>
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
                <p className="text-2xl font-semibold text-gray-800">5</p>
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
                <p className="text-2xl font-semibold text-gray-800">7</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-label-purple-bg rounded-lg">
                <FolderKanban className="size-5 text-label-purple-text" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">3</p>
                <p className="text-xs text-gray-500">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your authentication is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-success-light text-success-dark p-4 rounded-lg">
              <p className="font-medium">Authentication successful!</p>
              <p className="text-sm mt-1">
                You are signed in as <strong>{user?.email}</strong>
              </p>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="text-gray-500">User ID:</span>{' '}
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {user?.id}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Name:</span> {user?.name}
              </p>
              <p>
                <span className="text-gray-500">Email:</span> {user?.email}
              </p>
              <p>
                <span className="text-gray-500">Provider:</span>{' '}
                <span className="capitalize">{user?.provider || 'local'}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
