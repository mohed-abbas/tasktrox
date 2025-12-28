'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Tasktrox!</CardTitle>
            <CardDescription>
              Your authentication is working. This is a placeholder dashboard page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-success-light text-success-dark p-4 rounded-md">
                <p className="font-medium">Authentication successful!</p>
                <p className="text-sm mt-1">
                  You are signed in as <strong>{user?.email}</strong>
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>User ID:</strong> {user?.id}
                </p>
                <p>
                  <strong>Name:</strong> {user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Provider:</strong> {user?.provider || 'local'}
                </p>
              </div>

              <p className="text-gray-500 text-sm">
                The full dashboard UI will be implemented in Phase 3.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
