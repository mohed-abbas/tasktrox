'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  deleteAccount,
  type UpdateProfileData,
  type ChangePasswordData,
} from '@/lib/api/user';

export function useProfile() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update auth state with new user data
      queryClient.setQueryData(['auth', 'me'], (old: { user: typeof user } | undefined) => {
        if (!old) return old;
        return { ...old, user: { ...old.user, ...updatedUser } };
      });
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (data) => {
      // Update auth state with new avatar
      queryClient.setQueryData(['auth', 'me'], (old: { user: typeof user } | undefined) => {
        if (!old) return old;
        return { ...old, user: { ...old.user, avatar: data.avatar } };
      });
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => {
      // Update auth state to remove avatar
      queryClient.setQueryData(['auth', 'me'], (old: { user: typeof user } | undefined) => {
        if (!old) return old;
        return { ...old, user: { ...old.user, avatar: null } };
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data),
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      // Logout after account deletion
      logout();
    },
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    uploadAvatar: uploadAvatarMutation.mutate,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,

    deleteAvatar: deleteAvatarMutation.mutate,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    deleteAvatarError: deleteAvatarMutation.error,

    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,

    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,
    deleteAccountError: deleteAccountMutation.error,
  };
}
