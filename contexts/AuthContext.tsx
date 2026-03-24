import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import {
  checkAuthService,
  loginService,
  logoutService,
  registerService,
  AuthResponse,
} from '@/services/authService';

export interface User {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginPending: boolean;
  isSignupPending: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const authKeys = {
  me: ['auth', 'me'] as const,
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('accessToken').then((token) => {
      setHasToken(!!token);
      setTokenChecked(true);
    });
  }, []);

  // current user — only runs when a stored token exists
  const { data, isLoading: isQueryLoading } = useQuery<AuthResponse>({
    queryKey: authKeys.me,
    queryFn: checkAuthService,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 min
    enabled: tokenChecked && hasToken,
  });

  const isLoading = !tokenChecked || (hasToken && isQueryLoading);
  const user: User | null = data?.user ?? null;

  //login
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginService({ email, password }),
    onSuccess: async (res) => {
      await SecureStore.setItemAsync('accessToken', res.accessToken);
      setHasToken(true);
      queryClient.setQueryData<AuthResponse>(authKeys.me, res);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  // signup
  const signupMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      registerService({ fullName: name, email, password }),
    onSuccess: async (res) => {
      await SecureStore.setItemAsync('accessToken', res.accessToken);
      setHasToken(true);
      queryClient.setQueryData<AuthResponse>(authKeys.me, res);
    },
  });

  const signup = async (name: string, email: string, password: string) => {
    await signupMutation.mutateAsync({ name, email, password });
  };

  // logout
  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSettled: async () => {
      await SecureStore.deleteItemAsync('accessToken');
      setHasToken(false);
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoginPending: loginMutation.isPending,
        isSignupPending: signupMutation.isPending,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
