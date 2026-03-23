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

// ─── Admin Endpoints ────────────────────────────────────────

export async function getAllCategoriesAdminService() {
  try {
    const { data } = await axiosInstance.get('/api/categories/admin/all');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'getAllCategoriesAdmin error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function createCategoryService(categoryData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.post('/api/categories', categoryData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('createCategory error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateCategoryService(categoryId: string, categoryData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.put(`/api/categories/${categoryId}`, categoryData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateCategory error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function deleteCategoryService(categoryId: string) {
  try {
    const { data } = await axiosInstance.delete(`/api/categories/${categoryId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('deleteCategory error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function reorderCategoryService(categoryId: string, orderData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.patch(`/api/categories/${categoryId}/order`, orderData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('reorderCategory error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
