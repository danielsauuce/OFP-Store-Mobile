import { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from './axiosInstance';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

export async function uploadImageService(file: RNFile, folder: string = 'general') {
  try {
    const token = await SecureStore.getItemAsync('accessToken');

    const formData = new FormData();
    formData.append('image', file as unknown as Blob);
    formData.append('folder', folder);

    const response = await fetch(`${API_URL}/api/media/upload/single`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message ?? 'Upload failed');
    return data;
  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
}

export async function uploadMultipleImagesService(files: RNFile[], folder: string = 'general') {
  try {
    const token = await SecureStore.getItemAsync('accessToken');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file as unknown as Blob);
    });
    formData.append('folder', folder);

    const response = await fetch(`${API_URL}/api/media/upload/multiple`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message ?? 'Upload failed');
    return data;
  } catch (error) {
    console.error('uploadMultipleImages error:', error);
    throw error;
  }
}

export async function getAllMediaService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/media/upload/all', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getAllMedia error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
