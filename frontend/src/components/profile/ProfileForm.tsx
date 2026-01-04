'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
  name: string;
  email: string;
  onSubmit: (data: { name?: string; email?: string }) => void;
  isLoading: boolean;
  error: Error | null;
}

export function ProfileForm({ name, email, onSubmit, isLoading, error }: ProfileFormProps) {
  const [formData, setFormData] = useState({ name, email });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: { name?: string; email?: string } = {};

    if (formData.name !== name) {
      updates.name = formData.name;
    }
    if (formData.email !== email) {
      updates.email = formData.email;
    }

    if (Object.keys(updates).length > 0) {
      onSubmit(updates);
    }
  };

  const hasChanges = formData.name !== name || formData.email !== email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error.message || 'Failed to update profile'}
            </p>
          )}

          <Button type="submit" disabled={isLoading || !hasChanges}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
