'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState, RegisterInput, LoginInput } from '@/types/auth';
import * as authApi from '@/lib/api/auth';

interface AuthContextType extends AuthState {
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage key
const TOKEN_KEY = 'tasktrox_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Get stored token
  const getStoredToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  // Set token in storage and axios
  const setToken = useCallback((token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  // Refresh authentication state
  const refreshAuth = useCallback(async () => {
    try {
      // Try to refresh token first
      const { accessToken } = await authApi.refreshToken();
      setToken(accessToken);

      // Get user data
      const user = await authApi.getMe();

      setState({
        user,
        accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      // Clear state if refresh fails
      setToken(null);
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [setToken]);

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      const token = getStoredToken();

      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Try to get user with stored token
        const user = await authApi.getMe();
        setState({
          user,
          accessToken: token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        // Token invalid, try refresh
        await refreshAuth();
      }
    };

    init();
  }, [getStoredToken, refreshAuth]);

  // Login
  const login = useCallback(
    async (data: LoginInput) => {
      const { user, accessToken } = await authApi.login(data);
      setToken(accessToken);
      setState({
        user,
        accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
      router.push('/dashboard');
    },
    [router, setToken]
  );

  // Register
  const register = useCallback(
    async (data: RegisterInput) => {
      const { user, accessToken } = await authApi.register(data);
      setToken(accessToken);
      setState({
        user,
        accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
      router.push('/dashboard');
    },
    [router, setToken]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      setToken(null);
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push('/login');
    }
  }, [router, setToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
