'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
  type ProjectMember,
} from '@/lib/api/projects';
import { useAuth } from './useAuth';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

interface UseProjectMembersOptions {
  projectId: string;
}

/**
 * Hook for project member management.
 * Provides query for fetching members and mutations for add/update/remove.
 */
export function useProjectMembers({ projectId }: UseProjectMembersOptions) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Fetch project members
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery<ProjectMember[]>({
    queryKey: ['project-members', projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });

  // Find current user's role in this project
  const currentUserMember = members.find((m) => m.userId === currentUser?.id);
  const currentUserRole = currentUserMember?.role || null;

  // Permission helpers
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN';
  const isMember = currentUserRole === 'MEMBER';
  const isViewer = currentUserRole === 'VIEWER';

  // Can manage members (add/remove) - owner or admin
  const canManageMembers = isOwner || isAdmin;
  // Can change member roles - owner only
  const canChangeRoles = isOwner;
  // Can create/edit/move tasks - everyone except viewer
  const canEditTasks = !isViewer && currentUserRole !== null;
  // Can access project settings page - everyone except viewer
  const canAccessSettings = !isViewer && currentUserRole !== null;
  // Can edit project name/description - owner or admin
  const canEditProject = isOwner || isAdmin;
  // Can delete project - owner only
  const canDeleteProject = isOwner;

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({
      email,
      role,
    }: {
      email: string;
      role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    }) => addProjectMember(projectId, email, role),
    onSuccess: (newMember) => {
      // Update cache with new member
      queryClient.setQueryData<ProjectMember[]>(
        ['project-members', projectId],
        (old = []) => [...old, newMember]
      );
      toast.success('Member added', {
        description: `${newMember.user.name} has been added to the project`,
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Please try again';
      toast.error('Failed to add member', { description: message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    }) => updateMemberRole(projectId, userId, role),
    onMutate: async ({ userId, role }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project-members', projectId] });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<ProjectMember[]>([
        'project-members',
        projectId,
      ]);

      // Optimistically update the role
      queryClient.setQueryData<ProjectMember[]>(
        ['project-members', projectId],
        (old = []) =>
          old.map((member) =>
            member.userId === userId ? { ...member, role } : member
          )
      );

      return { previousMembers };
    },
    onSuccess: (updatedMember) => {
      toast.success('Role updated', {
        description: `${updatedMember.user.name} is now ${updatedMember.role.toLowerCase()}`,
      });
    },
    onError: (err, _vars, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ['project-members', projectId],
          context.previousMembers
        );
      }
      const message = err instanceof Error ? err.message : 'Please try again';
      toast.error('Failed to update role', { description: message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMember(projectId, userId),
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project-members', projectId] });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<ProjectMember[]>([
        'project-members',
        projectId,
      ]);

      // Get member name for toast
      const memberToRemove = previousMembers?.find((m) => m.userId === userId);

      // Optimistically remove the member
      queryClient.setQueryData<ProjectMember[]>(
        ['project-members', projectId],
        (old = []) => old.filter((member) => member.userId !== userId)
      );

      return { previousMembers, memberName: memberToRemove?.user.name };
    },
    onSuccess: (_data, _userId, context) => {
      toast.success('Member removed', {
        description: context?.memberName
          ? `${context.memberName} has been removed from the project`
          : 'Member has been removed',
      });
    },
    onError: (err, _userId, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ['project-members', projectId],
          context.previousMembers
        );
      }
      const message = err instanceof Error ? err.message : 'Please try again';
      toast.error('Failed to remove member', { description: message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return {
    // Data
    members,
    isLoading,
    error,

    // Current user info
    currentUserRole,

    // Permission flags
    isOwner,
    isAdmin,
    isMember,
    isViewer,
    canManageMembers,
    canChangeRoles,
    canEditTasks,
    canAccessSettings,
    canEditProject,
    canDeleteProject,

    // Mutations
    addMember: (email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') =>
      addMemberMutation.mutateAsync({ email, role }),
    updateRole: (userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') =>
      updateRoleMutation.mutateAsync({ userId, role }),
    removeMember: removeMemberMutation.mutateAsync,

    // Loading states
    isAdding: addMemberMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
  };
}

export default useProjectMembers;
