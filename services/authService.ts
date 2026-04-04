import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

// Backend may return profilePicture as a Cloudinary object {secureUrl, url} or a plain string.
// Always normalise to a plain string before storing in context.
function normalisePicture(pic: unknown): string | undefined {
  if (typeof pic === 'string') return pic || undefined;
  if (pic && typeof pic === 'object') {
    // Cloudinary returns snake_case (secure_url / url); some backends camelCase it (secureUrl)
    const p = pic as { secure_url?: string; secureUrl?: string; url?: string };
    return p.secure_url ?? p.secureUrl ?? p.url ?? undefined;
  }
  return undefined;
}

function normaliseAuthResponse(data: AuthResponse): AuthResponse {
  return {
    ...data,
    user: { ...data.user, profilePicture: normalisePicture(data.user.profilePicture) },
  };
}

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
    profilePicture?: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
}

export const registerService = async (payload: RegisterPayload): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<AuthResponse>('/api/auth/register', payload);
    return normaliseAuthResponse(data);
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('API ERROR:', err?.response?.data?.message || err.message);
    throw new Error(err?.response?.data?.message || 'Something went wrong');
  }
};

export const loginService = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<AuthResponse>('/api/auth/login', payload);
    return normaliseAuthResponse(data);
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
    return normaliseAuthResponse(data);
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

export const refreshTokenService = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const { data } = await axiosInstance.post('/api/auth/refresh-token', { refreshToken });
    return data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    throw new Error(err?.response?.data?.message || 'Session expired');
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
