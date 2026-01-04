'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePresence } from '@/hooks/usePresence';
import { PresenceIndicator } from '@/components/presence/PresenceIndicator';

// Column status configuration with colors from Figma
export const columnHeaderConfig: Record<
  string,
  {
    headerBg: string;
    headerText: string;
    countBg: string;
    countText: string;
  }
> = {
  'To Do': {
    headerBg: 'bg-label-purple-bg',
    headerText: 'text-label-purple-text',
    countBg: 'bg-[#DDD6FE]',
    countText: 'text-label-purple-text',
  },
  'In Progress': {
    headerBg: 'bg-label-yellow-bg',
    headerText: 'text-label-yellow-text',
    countBg: 'bg-[#FDE68A]',
    countText: 'text-label-yellow-text',
  },
  'In Review': {
    headerBg: 'bg-[#F5F3FF]',
    headerText: 'text-[#8B5CF6]',
    countBg: 'bg-[#DDD6FE]',
    countText: 'text-[#8B5CF6]',
  },
  Review: {
    headerBg: 'bg-[#F5F3FF]',
    headerText: 'text-[#8B5CF6]',
    countBg: 'bg-[#DDD6FE]',
    countText: 'text-[#8B5CF6]',
  },
  Done: {
    headerBg: 'bg-label-green-bg',
    headerText: 'text-label-green-text',
    countBg: 'bg-[#A7F3D0]',
    countText: 'text-label-green-text',
  },
  Completed: {
    headerBg: 'bg-label-green-bg',
    headerText: 'text-label-green-text',
    countBg: 'bg-[#A7F3D0]',
    countText: 'text-label-green-text',
  },
};

// Default config for unknown column names
const defaultHeaderConfig = {
  headerBg: 'bg-gray-100',
  headerText: 'text-gray-700',
  countBg: 'bg-gray-200',
  countText: 'text-gray-600',
};

export interface ColumnHeaderProps {
  id: string;
  name: string;
  taskCount: number;
  projectId?: string;
  onNameChange?: (newName: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  className?: string;
}

export function ColumnHeader({
  id,
  name,
  taskCount,
  projectId,
  onNameChange,
  onEdit: _onEdit,
  onDelete,
  isEditable = true,
  className,
}: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Presence tracking for column name editing
  const columnPresence = usePresence({
    projectId: projectId || '',
    taskId: id, // column id is used as taskId for presence
    field: 'column-name',
    enabled: !!projectId && isEditable,
  });

  // Get column-specific styling based on name
  const config = columnHeaderConfig[name] || defaultHeaderConfig;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when name changes externally
  useEffect(() => {
    setEditValue(name);
  }, [name]);

  const handleStartEdit = () => {
    if (!isEditable) return;
    setIsEditing(true);
    setEditValue(name);
    columnPresence.startEditing();
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== name) {
      onNameChange?.(trimmedValue);
    } else {
      setEditValue(name); // Reset to original if empty or unchanged
    }
    setIsEditing(false);
    columnPresence.stopEditing();
  };

  const handleCancel = () => {
    setEditValue(name);
    setIsEditing(false);
    columnPresence.stopEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-xl',
        config.headerBg,
        className
      )}
      data-column-header-id={id}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Column Name - Editable */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onFocus={columnPresence.startEditing}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              'text-base font-medium leading-6 bg-white/50 rounded px-2 py-0.5 outline-none ring-2 ring-white/50 w-full max-w-[180px]',
              config.headerText
            )}
            maxLength={50}
          />
        ) : (
          <>
            <span
              className={cn(
                'text-base font-medium leading-6 truncate cursor-pointer hover:opacity-80 transition-opacity',
                config.headerText,
                isEditable && 'cursor-text'
              )}
              onClick={handleStartEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartEdit();
                }
              }}
              role={isEditable ? 'button' : undefined}
              tabIndex={isEditable ? 0 : undefined}
              title={isEditable ? 'Click to edit column name' : name}
            >
              {name}
            </span>
            {/* Presence indicator - show when someone else is editing */}
            {columnPresence.editingUser && (
              <PresenceIndicator
                user={{
                  id: columnPresence.editingUser.id,
                  name: columnPresence.editingUser.name,
                  avatar: columnPresence.editingUser.avatar || null,
                }}
                size="sm"
              />
            )}
          </>
        )}

        {/* Task Count Badge */}
        <div
          className={cn(
            'flex items-center justify-center size-6 rounded-full text-xs font-medium flex-shrink-0',
            config.countBg,
            config.countText
          )}
        >
          {taskCount}
        </div>
      </div>

      {/* More Options Dropdown - only show when editable */}
      {isEditable && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'p-1 rounded-md transition-colors hover:bg-black/5 flex-shrink-0',
                config.headerText
              )}
              aria-label={`More options for ${name} column`}
            >
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                handleStartEdit();
              }}
            >
              <Pencil className="size-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default ColumnHeader;
