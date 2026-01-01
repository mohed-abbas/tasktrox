'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FilterState } from '@/components/filter';
import type { Task } from '@/lib/api/tasks';

const emptyFilters: FilterState = {
  priority: [],
  labels: [],
  assignees: [],
  dueDate: null,
};

interface UseFiltersOptions {
  initialFilters?: Partial<FilterState>;
}

/**
 * Hook for managing filter state and applying filters to tasks.
 */
export function useFilters({ initialFilters = {} }: UseFiltersOptions = {}) {
  const [filters, setFilters] = useState<FilterState>({
    ...emptyFilters,
    ...initialFilters,
  });

  const clearFilters = useCallback(() => {
    setFilters(emptyFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.priority.length > 0 ||
      filters.labels.length > 0 ||
      filters.assignees.length > 0 ||
      filters.dueDate !== null
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priority.length > 0) count++;
    if (filters.labels.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.dueDate !== null) count++;
    return count;
  }, [filters]);

  /**
   * Filter a list of tasks based on current filter state.
   */
  const filterTasks = useCallback(
    (tasks: Task[]): Task[] => {
      if (!hasActiveFilters) return tasks;

      return tasks.filter((task) => {
        // Priority filter
        if (filters.priority.length > 0) {
          if (!task.priority || !filters.priority.includes(task.priority as 'HIGH' | 'MEDIUM' | 'LOW')) {
            return false;
          }
        }

        // Labels filter
        if (filters.labels.length > 0) {
          const taskLabelIds = (task.labels || []).map((l) => l.id);
          const hasMatchingLabel = filters.labels.some((labelId) =>
            taskLabelIds.includes(labelId)
          );
          if (!hasMatchingLabel) return false;
        }

        // Assignees filter
        if (filters.assignees.length > 0) {
          const taskAssigneeIds = (task.assignees || []).map((a) => a.id);
          const hasMatchingAssignee = filters.assignees.some((userId) =>
            taskAssigneeIds.includes(userId)
          );
          if (!hasMatchingAssignee) return false;
        }

        // Due date filter
        if (filters.dueDate !== null) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);

          if (filters.dueDate === 'none') {
            if (task.dueDate) return false;
          } else if (filters.dueDate === 'overdue') {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            if (dueDate >= today) return false;
          } else if (filters.dueDate === 'today') {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            const dueDateDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            if (dueDateDay.getTime() !== today.getTime()) return false;
          } else if (filters.dueDate === 'week') {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            if (dueDate < today || dueDate > weekEnd) return false;
          }
        }

        return true;
      });
    },
    [filters, hasActiveFilters]
  );

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    filterTasks,
  };
}

export default useFilters;
