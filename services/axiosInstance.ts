import axios, { AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000;

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
});

// Request interceptor — attaches access token for all direct service calls
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

// Response interceptor — handles token refresh on 401 (except on auth endpoints)
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config as AxiosRequestConfig & { _retried?: boolean };
    const isAuthEndpoint =
      originalConfig?.url?.includes('/api/auth/me') ||
      originalConfig?.url?.includes('/api/auth/refresh-token');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalConfig._retried) {
      originalConfig._retried = true;

      if (isRefreshing) {
        // Wait for the ongoing refresh then retry
        const newToken = await new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        });
        originalConfig.headers = {
          ...originalConfig.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalConfig);
      }

      isRefreshing = true;
      try {
        const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!storedRefreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        });
        const newAccessToken: string = data.accessToken;
        await SecureStore.setItemAsync('accessToken', newAccessToken);

        refreshQueue.forEach((resolve) => resolve(newAccessToken));
        refreshQueue = [];

        originalConfig.headers = {
          ...originalConfig.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        return api(originalConfig);
      } catch {
        refreshQueue = [];
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      // Silence expected 401 on auth-check and 403 on chat (user-scoped endpoints)
      const isAuthCheck = originalConfig?.url?.includes('/api/auth/me');
      const isChatSilenced = originalConfig?.url?.includes('/api/chat/') && error.response.status === 403;
      if (!(isAuthCheck && error.response.status === 401) && !isChatSilenced) {
        console.error(`API request failed: ${originalConfig?.method?.toUpperCase()} ${originalConfig?.url}`, {
          status: error.response.status,
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      console.warn('API request timed out', {
        endpoint: originalConfig?.url,
        method: originalConfig?.method,
      });
      error.message = 'Request timed out. The server may be starting up — please try again.';
    } else if (error.request) {
      console.warn('API request failed - no response', {
        endpoint: originalConfig?.url,
        method: originalConfig?.method,
      });
      error.message = 'No response from server. Check your internet connection.';
    }
    return Promise.reject(error);
  },
);

export default api;
