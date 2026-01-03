'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';

interface PasswordChangeProps {
  provider: string | null;
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  isLoading: boolean;
  error: Error | null;
}

export function PasswordChange({ provider, onSubmit, isLoading, error }: PasswordChangeProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);

  // OAuth users can't change password
  if (provider && provider !== 'local') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Manage your password</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You signed in with {provider === 'google' ? 'Google' : provider}.
            Password management is handled by your identity provider.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }

    if (formData.newPassword.length < 8) {
      return;
    }

    onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    // Clear form and show success
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const passwordValid = formData.newPassword.length >= 8;
  const canSubmit =
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword &&
    passwordsMatch &&
    passwordValid;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Enter new password (min 8 characters)"
              disabled={isLoading}
            />
            {formData.newPassword && !passwordValid && (
              <p className="text-xs text-red-500">Password must be at least 8 characters</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              disabled={isLoading}
            />
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error.message || 'Failed to change password'}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-500 flex items-center gap-1">
              <Check className="size-4" />
              Password changed successfully
            </p>
          )}

          <Button type="submit" disabled={isLoading || !canSubmit}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
