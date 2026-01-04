'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Flag,
  Tag,
  Users,
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Label } from '@/lib/api/labels';
import type { Priority } from '@/components/task/PrioritySelector';

// Filter state interface
export interface FilterState {
  priority: Priority[];
  labels: string[]; // Label IDs
  assignees: string[]; // User IDs
  dueDate: 'overdue' | 'today' | 'week' | 'none' | null;
}

// Empty filter state
export const emptyFilters: FilterState = {
  priority: [],
  labels: [],
  assignees: [],
  dueDate: null,
};

// Check if any filters are active
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.priority.length > 0 ||
    filters.labels.length > 0 ||
    filters.assignees.length > 0 ||
    filters.dueDate !== null
  );
}

// Get count of active filters
export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.priority.length > 0) count++;
  if (filters.labels.length > 0) count++;
  if (filters.assignees.length > 0) count++;
  if (filters.dueDate !== null) count++;
  return count;
}

export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  labels?: Label[];
  members?: { id: string; name: string; avatar?: string | null }[];
  className?: string;
}

// Priority options
const priorityOptions: { value: 'HIGH' | 'MEDIUM' | 'LOW'; label: string; color: string }[] = [
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700' },
];

// Due date options
const dueDateOptions: { value: FilterState['dueDate']; label: string }[] = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'Due this week' },
  { value: 'none', label: 'No due date' },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  labels = [],
  members = [],
  className,
}: FilterPanelProps) {
  const activeCount = getActiveFilterCount(filters);
  const hasFilters = activeCount > 0;

  const handlePriorityToggle = useCallback(
    (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
      const newPriority = filters.priority.includes(priority)
        ? filters.priority.filter((p) => p !== priority)
        : [...filters.priority, priority];
      onFiltersChange({ ...filters, priority: newPriority });
    },
    [filters, onFiltersChange]
  );

  const handleLabelToggle = useCallback(
    (labelId: string) => {
      const newLabels = filters.labels.includes(labelId)
        ? filters.labels.filter((l) => l !== labelId)
        : [...filters.labels, labelId];
      onFiltersChange({ ...filters, labels: newLabels });
    },
    [filters, onFiltersChange]
  );

  const handleAssigneeToggle = useCallback(
    (userId: string) => {
      const newAssignees = filters.assignees.includes(userId)
        ? filters.assignees.filter((a) => a !== userId)
        : [...filters.assignees, userId];
      onFiltersChange({ ...filters, assignees: newAssignees });
    },
    [filters, onFiltersChange]
  );

  const handleDueDateChange = useCallback(
    (dueDate: FilterState['dueDate']) => {
      onFiltersChange({
        ...filters,
        dueDate: filters.dueDate === dueDate ? null : dueDate,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange(emptyFilters);
  }, [onFiltersChange]);

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 gap-1.5 text-xs',
              filters.priority.length > 0 && 'bg-primary-50 border-primary-200 text-primary-700'
            )}
          >
            <Flag className="h-3.5 w-3.5" />
            Priority
            {filters.priority.length > 0 && (
              <span className="ml-0.5 rounded-full bg-primary-200 px-1.5 text-[10px] font-medium">
                {filters.priority.length}
              </span>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {priorityOptions.map((option) => {
              const isSelected = filters.priority.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handlePriorityToggle(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                    'hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-gray-50'
                  )}
                >
                  <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', option.color)}>
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary-600" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Labels Filter */}
      {labels.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 gap-1.5 text-xs',
                filters.labels.length > 0 && 'bg-primary-50 border-primary-200 text-primary-700'
              )}
            >
              <Tag className="h-3.5 w-3.5" />
              Labels
              {filters.labels.length > 0 && (
                <span className="ml-0.5 rounded-full bg-primary-200 px-1.5 text-[10px] font-medium">
                  {filters.labels.length}
                </span>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {labels.map((label) => {
                const isSelected = filters.labels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => handleLabelToggle(label.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                      'hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-gray-50'
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-gray-700 truncate">{label.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Assignees Filter */}
      {members.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 gap-1.5 text-xs',
                filters.assignees.length > 0 && 'bg-primary-50 border-primary-200 text-primary-700'
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Assignees
              {filters.assignees.length > 0 && (
                <span className="ml-0.5 rounded-full bg-primary-200 px-1.5 text-[10px] font-medium">
                  {filters.assignees.length}
                </span>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {members.map((member) => {
                const isSelected = filters.assignees.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => handleAssigneeToggle(member.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                      'hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-gray-50'
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-gray-700 truncate">{member.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Due Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 gap-1.5 text-xs',
              filters.dueDate && 'bg-primary-50 border-primary-200 text-primary-700'
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            Due Date
            {filters.dueDate && (
              <span className="ml-0.5 rounded-full bg-primary-200 px-1.5 text-[10px] font-medium">
                1
              </span>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="start">
          <div className="space-y-1">
            {dueDateOptions.map((option) => {
              const isSelected = filters.dueDate === option.value;
              return (
                <button
                  key={option.value || 'none'}
                  onClick={() => handleDueDateChange(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                    'hover:bg-gray-50 transition-colors text-left',
                    isSelected && 'bg-gray-50'
                  )}
                >
                  <span className="text-gray-700">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary-600" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All Button */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FilterPanel;
