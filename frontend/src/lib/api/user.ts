import api from '../axios';

// Types matching backend
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// API functions
export async function getMe(): Promise<SafeUser> {
  const response = await api.get<{ success: boolean; data: { user: SafeUser } }>('/users/me');
  return response.data.data.user;
}

export async function updateProfile(data: UpdateProfileData): Promise<SafeUser> {
  const response = await api.patch<{ success: boolean; data: { user: SafeUser } }>(
    '/users/me',
    data
  );
  return response.data.data.user;
}

export async function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post<{ success: boolean; data: { avatar: string } }>(
    '/users/me/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

export async function deleteAvatar(): Promise<void> {
  await api.delete('/users/me/avatar');
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await api.patch('/users/me/password', data);
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/users/me');
}
