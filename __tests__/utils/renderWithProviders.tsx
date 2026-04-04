import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Minimal theme matching ThemeContext shape
export const mockColors = {
  background: '#fff',
  surface: '#f8f8f8',
  surfaceVariant: '#efefef',
  text: '#111',
  textSecondary: '#555',
  textTertiary: '#999',
  primary: '#6366f1',
  onPrimary: '#fff',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  badge: '#ef4444',
};

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: mockColors, isDark: false, toggleTheme: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', fullName: 'Test User', email: 'test@test.com' },
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
  }),
  authKeys: { me: ['auth', 'me'] },
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = makeQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, options);
}
