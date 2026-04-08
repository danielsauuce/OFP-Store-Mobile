import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export async function getAllCategoriesService() {
  try {
    const { data } = await axiosInstance.get('/api/categories');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getAllCategories error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getCategoryBySlugService(slug: string) {
  try {
    const { data } = await axiosInstance.get(`/api/categories/${slug}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getCategoryBySlug error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
