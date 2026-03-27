import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  accessToken: string;
}

export interface ApiError {
  message: string;
}

export const registerService = async (payload: RegisterPayload): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<AuthResponse>('/api/auth/register', payload);
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const loginService = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<AuthResponse>('/api/auth/login', payload);
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const logoutService = async (): Promise<void> => {
  try {
    await axiosInstance.post('/api/auth/logout');
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const checkAuthService = async (): Promise<AuthResponse | null> => {
  try {
    const { data } = await axiosInstance.get<AuthResponse>('/api/auth/me');
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    // 401 = expired/invalid token, network errors = treat as unauthenticated
    if (err.response?.status === 401 || err.code === 'ECONNABORTED' || !err.response) return null;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const changePasswordService = async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
  try {
    const { data } = await axiosInstance.post('/api/auth/change-password', payload);
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const forgotPasswordService = async (email: string): Promise<{ message: string }> => {
  try {
    const { data } = await axiosInstance.post('/api/auth/forgot-password', { email });
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const resetPasswordService = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    const { data } = await axiosInstance.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};
