import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attaches token for all direct service calls
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Silence expected 401 on the auth-check endpoint — it just means no active session
      const isAuthCheck = error.config?.url?.includes('/api/auth/me');
      if (!(isAuthCheck && error.response.status === 401)) {
        console.error(`API request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response.status,
        });
      }
    } else if (error.request) {
      console.warn('API request failed - no response', {
        endpoint: error.config?.url,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  },
);

export const useApi = () => {
  const apiWithAuth = useCallback(async <T>(config: Parameters<typeof api.request>[0]) => {
    const token = await SecureStore.getItemAsync('accessToken');
    return api.request<T>({
      ...config,
      headers: { ...config.headers, ...(token && { Authorization: `Bearer ${token}` }) },
    });
  }, []);

  return { api, apiWithAuth };
};

export default api;
