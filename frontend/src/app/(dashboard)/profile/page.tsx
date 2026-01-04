'use client';

import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ProfileForm,
  AvatarUpload,
  PasswordChange,
  DangerZone,
} from '@/components/profile';

export default function ProfilePage() {
  const {
    user,
    updateProfile,
    isUpdatingProfile,
    updateProfileError,
    uploadAvatar,
    isUploadingAvatar,
    uploadAvatarError,
    deleteAvatar,
    isDeletingAvatar,
    changePassword,
    isChangingPassword,
    changePasswordError,
    deleteAccount,
    isDeletingAccount,
    deleteAccountError,
  } = useProfile();

  if (!user) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Avatar Upload */}
      <AvatarUpload
        name={user.name}
        avatar={user.avatar}
        onUpload={uploadAvatar}
        onDelete={deleteAvatar}
        isUploading={isUploadingAvatar}
        isDeleting={isDeletingAvatar}
        uploadError={uploadAvatarError}
      />

      {/* Profile Form */}
      <ProfileForm
        name={user.name}
        email={user.email}
        onSubmit={updateProfile}
        isLoading={isUpdatingProfile}
        error={updateProfileError}
      />

      {/* Password Change */}
      <PasswordChange
        provider={user.provider ?? null}
        onSubmit={changePassword}
        isLoading={isChangingPassword}
        error={changePasswordError}
      />

      {/* Danger Zone */}
      <DangerZone
        email={user.email}
        onDelete={deleteAccount}
        isDeleting={isDeletingAccount}
        error={deleteAccountError}
      />
    </div>
  );
}
