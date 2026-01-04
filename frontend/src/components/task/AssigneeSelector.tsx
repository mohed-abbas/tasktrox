'use client';

import { useState, useCallback, useMemo } from 'react';
import { UserPlus, X, Check, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Assignee, ProjectMember } from '@/lib/api/assignees';

export interface AssigneeSelectorProps {
  assignees: Assignee[];
  members: ProjectMember[];
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function AssigneeSelector({
  assignees,
  members,
  onAdd,
  onRemove,
  disabled = false,
  className,
  isLoading = false,
}: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get assigned user IDs for quick lookup
  const assignedIds = useMemo(
    () => new Set(assignees.map((a) => a.id)),
    [assignees]
  );

  // Filter members by search
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const term = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
    );
  }, [members, search]);

  const handleToggle = useCallback(
    (userId: string) => {
      if (assignedIds.has(userId)) {
        onRemove(userId);
      } else {
        onAdd(userId);
      }
    },
    [assignedIds, onAdd, onRemove]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal h-9',
            !assignees.length && 'text-gray-400',
            className
          )}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          <span className="flex-1">
            {assignees.length > 0 ? (
              <span className="flex items-center gap-1">
                {assignees.length} assignee{assignees.length !== 1 ? 's' : ''}
              </span>
            ) : (
              'Assign members'
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    'w-full pl-8 pr-3 py-1.5 text-sm rounded-md',
                    'border border-gray-200 focus:border-gray-400',
                    'focus:ring-2 focus:ring-gray-800/10 outline-none',
                    'placeholder:text-gray-400 transition-colors'
                  )}
                />
              </div>
            </div>

            {/* Member List */}
            <div className="max-h-60 overflow-y-auto p-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4 text-gray-400">
                  Loading members...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                  {search ? 'No members found' : 'No project members'}
                </div>
              ) : (
                filteredMembers.map((member, index) => {
                  const isAssigned = assignedIds.has(member.id);
                  return (
                    <motion.button
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleToggle(member.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                        'transition-colors text-left',
                        'hover:bg-gray-50',
                        isAssigned && 'bg-primary-50 hover:bg-primary-100'
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'size-8 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden',
                          isAssigned
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Name and email */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700 truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {member.email}
                        </div>
                      </div>

                      {/* Check indicator */}
                      {isAssigned && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Check className="h-4 w-4 text-primary-600" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Clear all if there are assignees */}
            {assignees.length > 0 && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => assignees.forEach((a) => onRemove(a.id))}
                  className={cn(
                    'w-full px-3 py-1.5 text-sm rounded-md',
                    'text-gray-500 hover:bg-gray-100 transition-colors'
                  )}
                >
                  Clear all assignees
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

// Simplified assignee type for display purposes (doesn't require email)
export interface DisplayAssignee {
  id: string;
  name: string;
  avatar?: string | null;
}

// Avatar Stack for displaying multiple assignees compactly
export interface AssigneeAvatarStackProps {
  assignees: DisplayAssignee[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRemove?: (userId: string) => void;
}

export function AssigneeAvatarStack({
  assignees,
  max = 3,
  size = 'md',
  className,
  onRemove,
}: AssigneeAvatarStackProps) {
  const visibleAssignees = assignees.slice(0, max);
  const remaining = assignees.length - max;

  const sizeClasses = {
    sm: 'size-6 text-xs',
    md: 'size-8 text-sm',
    lg: 'size-10 text-base',
  };

  const overlapClasses = {
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
  };

  if (assignees.length === 0) return null;

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAssignees.map((assignee, index) => (
        <motion.div
          key={assignee.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            sizeClasses[size],
            index > 0 && overlapClasses[size],
            'relative group'
          )}
        >
          <div
            className={cn(
              'rounded-full flex items-center justify-center',
              'font-medium overflow-hidden',
              'bg-gray-200 text-gray-600',
              'ring-2 ring-white',
              sizeClasses[size]
            )}
            title={assignee.name}
          >
            {assignee.avatar ? (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="size-full object-cover"
              />
            ) : (
              assignee.name.charAt(0).toUpperCase()
            )}
          </div>
          {/* Remove button on hover */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(assignee.id);
              }}
              className={cn(
                'absolute -top-1 -right-1 size-4',
                'bg-red-500 text-white rounded-full',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity hover:bg-red-600'
              )}
            >
              <X className="size-2.5" />
            </button>
          )}
        </motion.div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            overlapClasses[size],
            'rounded-full flex items-center justify-center',
            'font-medium bg-gray-100 text-gray-600',
            'ring-2 ring-white'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default AssigneeSelector;
