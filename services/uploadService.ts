import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

export async function uploadImageService(file: RNFile, folder: string = 'general') {
  try {
    const formData = new FormData();
    formData.append('image', file as unknown as Blob);
    formData.append('folder', folder);

    const { data } = await axiosInstance.post('/api/media/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('uploadImage error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function uploadMultipleImagesService(files: RNFile[], folder: string = 'general') {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file as unknown as Blob);
    });
    formData.append('folder', folder);

    const { data } = await axiosInstance.post('/api/media/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'uploadMultipleImages error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
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
