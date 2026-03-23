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

// Admin Endpoints

export async function getAllProductsAdminService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/admin/products', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'getAllProductsAdmin error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function getProductByIdAdminService(productId: string) {
  try {
    const { data } = await axiosInstance.get(`/api/admin/products/${productId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'getProductByIdAdmin error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function createProductService(productData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.post('/api/admin/products/create', productData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('createProduct error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateProductService(productId: string, productData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.put(`/api/admin/products/update/${productId}`, productData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateProduct error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function deleteProductService(productId: string) {
  try {
    const { data } = await axiosInstance.delete(`/api/admin/products/delete/${productId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('deleteProduct error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
