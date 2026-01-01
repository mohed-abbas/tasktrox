'use client';

import { useState } from 'react';
import {
  Crown,
  Shield,
  User,
  Eye,
  MoreHorizontal,
  Trash2,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectMember } from '@/lib/api/projects';

type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

const ROLE_CONFIG: Record<
  MemberRole,
  { label: string; icon: typeof Crown; color: string; bgColor: string }
> = {
  OWNER: {
    label: 'Owner',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  MEMBER: {
    label: 'Member',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  VIEWER: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

const ASSIGNABLE_ROLES: { value: 'ADMIN' | 'MEMBER' | 'VIEWER'; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'VIEWER', label: 'Viewer' },
];

export interface MembersListProps {
  members: ProjectMember[];
  currentUserId: string | undefined;
  canManageMembers: boolean;
  canChangeRoles: boolean;
  onUpdateRole: (userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') => Promise<unknown>;
  onRemoveMember: (userId: string) => Promise<unknown>;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

export function MembersList({
  members,
  currentUserId,
  canManageMembers,
  canChangeRoles,
  onUpdateRole,
  onRemoveMember,
  isUpdating = false,
  isRemoving = false,
}: MembersListProps) {
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    setUpdatingRole(userId);
    try {
      await onUpdateRole(userId, newRole);
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingMember(userId);
    try {
      await onRemoveMember(userId);
    } finally {
      setRemovingMember(null);
      setConfirmingRemove(null);
    }
  };

  // Sort members: Owner first, then by name
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'OWNER') return -1;
    if (b.role === 'OWNER') return 1;
    return a.user.name.localeCompare(b.user.name);
  });

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No members yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {sortedMembers.map((member) => {
        const roleConfig = ROLE_CONFIG[member.role];
        const RoleIcon = roleConfig.icon;
        const isCurrentUser = member.userId === currentUserId;
        const isOwner = member.role === 'OWNER';
        const isBeingUpdated = updatingRole === member.userId || isUpdating;
        const isBeingRemoved = removingMember === member.userId || isRemoving;
        const showConfirmRemove = confirmingRemove === member.userId;

        // Can this member be managed?
        const canEditThisMember = canManageMembers && !isOwner;
        const canRemoveThisMember = canEditThisMember || (isCurrentUser && !isOwner);

        return (
          <div
            key={member.id}
            className={cn(
              'flex items-center justify-between py-3 px-1',
              'transition-opacity',
              isBeingRemoved && 'opacity-50 pointer-events-none'
            )}
          >
            {/* Member info */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {member.user.avatar ? (
                  <img
                    src={member.user.avatar}
                    alt={member.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isCurrentUser && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"
                    title="You"
                  />
                )}
              </div>

              {/* Name & email */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {member.user.name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs text-gray-400">(you)</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 truncate block">
                  {member.user.email}
                </span>
              </div>
            </div>

            {/* Role & actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Role badge / selector */}
              {canChangeRoles && !isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={isBeingUpdated}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      'transition-colors cursor-pointer',
                      'hover:ring-2 hover:ring-gray-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                      roleConfig.bgColor,
                      roleConfig.color
                    )}
                  >
                    {isBeingUpdated ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RoleIcon className="h-3 w-3" />
                    )}
                    {roleConfig.label}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {ASSIGNABLE_ROLES.map((role) => {
                      const config = ROLE_CONFIG[role.value];
                      const Icon = config.icon;
                      const isSelected = member.role === role.value;

                      return (
                        <DropdownMenuItem
                          key={role.value}
                          onClick={() => handleRoleChange(member.userId, role.value)}
                          disabled={isSelected}
                          className={cn(
                            'flex items-center gap-2',
                            isSelected && 'bg-gray-50'
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5', config.color)} />
                          <span>{role.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    roleConfig.bgColor,
                    roleConfig.color
                  )}
                >
                  <RoleIcon className="h-3 w-3" />
                  {roleConfig.label}
                </span>
              )}

              {/* Actions menu */}
              {canRemoveThisMember && (
                <DropdownMenu
                  open={showConfirmRemove ? true : undefined}
                  onOpenChange={(open) => {
                    if (!open) setConfirmingRemove(null);
                  }}
                >
                  <DropdownMenuTrigger
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/20'
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {showConfirmRemove ? (
                      <>
                        <div className="px-2 py-1.5 text-xs text-gray-500">
                          {isCurrentUser
                            ? 'Leave this project?'
                            : `Remove ${member.user.name}?`}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemove(member.userId)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          {isBeingRemoved ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          {isCurrentUser ? 'Yes, leave' : 'Yes, remove'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirmingRemove(null)}>
                          Cancel
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => setConfirmingRemove(member.userId)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isCurrentUser ? 'Leave project' : 'Remove member'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MembersList;
