import axios from '../axios';
import type {
  AuthResponse,
  TokenResponse,
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  User,
} from '@/types/auth';
import type { ApiResponse } from '@/types/api';

// Register new user
export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await axios.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
}

// Login user
export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await axios.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
}

// Logout user
export async function logout(): Promise<void> {
  await axios.post('/auth/logout');
}

// Refresh access token
export async function refreshToken(): Promise<TokenResponse> {
  const response = await axios.post<ApiResponse<TokenResponse>>('/auth/refresh');
  return response.data.data!;
}

// Get current user
export async function getMe(): Promise<User> {
  const response = await axios.get<ApiResponse<{ user: User }>>('/auth/me');
  return response.data.data!.user;
}

// Request password reset
export async function forgotPassword(data: ForgotPasswordInput): Promise<void> {
  await axios.post('/auth/forgot-password', data);
}

// Reset password with token
export async function resetPassword(data: ResetPasswordInput): Promise<void> {
  await axios.post('/auth/reset-password', data);
}

// Exchange OAuth authorization code for tokens
export async function exchangeOAuthCode(code: string): Promise<AuthResponse> {
  const response = await axios.post<ApiResponse<AuthResponse>>('/auth/oauth/exchange', { code });
  return response.data.data!;
}

// OAuth URLs
export const getGoogleAuthUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  return `${baseUrl}/auth/google`;
};

export const getAppleAuthUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  return `${baseUrl}/auth/apple`;
};
