'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
  type MoveTaskInput,
} from '@/lib/api/tasks';

interface UseTasksOptions {
  projectId: string;
}

// Extended task with column info for board display
export interface TaskWithColumn extends Task {
  columnId: string;
}

/**
 * Hook for task CRUD operations with optimistic updates.
 * Provides mutations that update UI immediately and rollback on error.
 */
export function useTasks({ projectId }: UseTasksOptions) {
  const queryClient = useQueryClient();

  // Query for fetching all tasks
  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Helper to get current tasks data
  const getTasksData = () => {
    return queryClient.getQueryData<Task[]>(['tasks', projectId]) || [];
  };

  // Create task mutation with optimistic update
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(projectId, data),
    onMutate: async (newTaskData) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousTasks = getTasksData();

      // Calculate order if not provided
      const columnTasks = previousTasks.filter(
        (t) => t.columnId === newTaskData.columnId
      );
      const order = newTaskData.order ?? columnTasks.length;

      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        title: newTaskData.title,
        description: newTaskData.description ?? null,
        order,
        columnId: newTaskData.columnId,
        projectId,
        priority: newTaskData.priority ?? null,
        dueDate: newTaskData.dueDate ?? null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        labels: [],
        assignees: [],
        _count: { comments: 0, attachments: 0 },
      };

      queryClient.setQueryData<Task[]>(['tasks', projectId], [
        ...previousTasks,
        optimisticTask,
      ]);

      return { previousTasks };
    },
    onError: (err, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error('Failed to create task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Update task mutation with optimistic update
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      updateTask(projectId, taskId, data),
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousTasks = getTasksData();

      const updatedTasks = previousTasks.map((task) => {
        if (task.id !== taskId) return task;

        // Handle completed -> completedAt conversion for optimistic update
        const updates: Partial<Task> = { ...data, updatedAt: new Date().toISOString() };
        if ('completed' in data) {
          updates.completedAt = data.completed ? new Date().toISOString() : null;
          delete (updates as Record<string, unknown>).completed;
        }

        return { ...task, ...updates };
      });

      queryClient.setQueryData<Task[]>(['tasks', projectId], updatedTasks);

      return { previousTasks };
    },
    onError: (err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error('Failed to update task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Delete task mutation with optimistic update
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousTasks = getTasksData();

      const filteredTasks = previousTasks.filter((task) => task.id !== taskId);

      queryClient.setQueryData<Task[]>(['tasks', projectId], filteredTasks);

      return { previousTasks };
    },
    onError: (err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error('Failed to delete task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Move task mutation with optimistic update (for drag-and-drop)
  const moveTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      sourceColumnId: string;
      data: MoveTaskInput;
    }) => moveTask(projectId, taskId, data),
    onMutate: async ({ taskId, sourceColumnId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousTasks = getTasksData();

      // Find and remove task from current position
      const taskIndex = previousTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return { previousTasks };

      const movedTask = { ...previousTasks[taskIndex] };
      const tasksWithoutMoved = previousTasks.filter((t) => t.id !== taskId);

      // Update task's column and order
      movedTask.columnId = data.targetColumnId;
      movedTask.order = data.order;
      movedTask.updatedAt = new Date().toISOString();

      // Get tasks in target column (excluding the moved task)
      const targetColumnTasks = tasksWithoutMoved
        .filter((t) => t.columnId === data.targetColumnId)
        .sort((a, b) => a.order - b.order);

      // Get tasks in source column (if different from target)
      const sourceColumnTasks =
        sourceColumnId !== data.targetColumnId
          ? tasksWithoutMoved
              .filter((t) => t.columnId === sourceColumnId)
              .sort((a, b) => a.order - b.order)
          : [];

      // Insert moved task at new position
      targetColumnTasks.splice(data.order, 0, movedTask);

      // Update order values for target column
      targetColumnTasks.forEach((task, index) => {
        task.order = index;
      });

      // Update order values for source column (if cross-column move)
      if (sourceColumnId !== data.targetColumnId) {
        sourceColumnTasks.forEach((task, index) => {
          task.order = index;
        });
      }

      // Combine all tasks
      const otherTasks = tasksWithoutMoved.filter(
        (t) => t.columnId !== data.targetColumnId && t.columnId !== sourceColumnId
      );

      const updatedTasks = [
        ...otherTasks,
        ...targetColumnTasks,
        ...sourceColumnTasks,
      ];

      queryClient.setQueryData<Task[]>(['tasks', projectId], updatedTasks);

      return { previousTasks };
    },
    onError: (err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error('Failed to move task', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
      // Refetch to restore correct state on error
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    // No onSuccess refetch - local state is already correct from optimistic update
  });

  // Group tasks by column for board display
  const tasksByColumn = (tasksQuery.data || []).reduce(
    (acc, task) => {
      if (!acc[task.columnId]) {
        acc[task.columnId] = [];
      }
      acc[task.columnId].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  // Sort tasks within each column by order
  Object.keys(tasksByColumn).forEach((columnId) => {
    tasksByColumn[columnId].sort((a, b) => a.order - b.order);
  });

  return {
    // Query data
    tasks: tasksQuery.data || [],
    tasksByColumn,
    isLoadingTasks: tasksQuery.isLoading,
    tasksError: tasksQuery.error,
    refetchTasks: tasksQuery.refetch,

    // Mutations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,

    // Async versions for awaiting
    createTaskAsync: createTaskMutation.mutateAsync,
    updateTaskAsync: updateTaskMutation.mutateAsync,
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
    moveTaskAsync: moveTaskMutation.mutateAsync,

    // Loading states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isMoving: moveTaskMutation.isPending,
    isMutating:
      createTaskMutation.isPending ||
      updateTaskMutation.isPending ||
      deleteTaskMutation.isPending ||
      moveTaskMutation.isPending,

    // Error states
    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
    moveError: moveTaskMutation.error,
  };
}

export default useTasks;
