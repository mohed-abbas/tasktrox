'use client';

import { useState } from 'react';
import { UserPlus, Loader2, Mail, Shield, User, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type InviteRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

const ROLE_OPTIONS: {
  value: InviteRole;
  label: string;
  description: string;
  icon: typeof Shield;
}[] = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Can manage members and settings',
    icon: Shield,
  },
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can create and edit tasks',
    icon: User,
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Can only view tasks',
    icon: Eye,
  },
];

export interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (email: string, role: InviteRole) => Promise<unknown>;
  isLoading?: boolean;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  onAddMember,
  isLoading = false,
}: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setRole('MEMBER');
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddMember(trimmedEmail, role);
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error messages from backend
        if (err.message.includes('not found')) {
          setError('No user found with this email address');
        } else if (err.message.includes('already a member')) {
          setError('This user is already a member of this project');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to add member. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Add a team member by their email address. They must have an existing
            account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Error message */}
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Email input */}
          <div className="space-y-2">
            <label
              htmlFor="member-email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="colleague@example.com"
                className={cn(
                  'w-full pl-10 pr-4 py-2 text-sm bg-white border rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                  'transition-colors',
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200'
                )}
                autoFocus
                disabled={isSubmitting || isLoading}
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = role === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    disabled={isSubmitting || isLoading}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-primary-600' : 'text-gray-400'
                      )}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              {ROLE_OPTIONS.find((o) => o.value === role)?.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !email.trim()}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddMemberDialog;
