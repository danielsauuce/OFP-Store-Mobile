import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

// Public Endpoints

export async function getAllProductsService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/product', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getAllProducts error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getProductByIdService(productId: string) {
  try {
    const { data } = await axiosInstance.get(`/api/product/${productId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getProductById error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getProductsByCategoryService(slug: string, params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get(`/api/product/category/${slug}`, { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'getProductsByCategory error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}
