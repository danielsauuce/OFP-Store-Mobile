import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export async function getWishlistService() {
  try {
    const { data } = await axiosInstance.get('/api/wishlist');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getWishlist error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function addToWishlistService(productId: string) {
  try {
    const { data } = await axiosInstance.post('/api/wishlist', { productId });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('addToWishlist error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function removeFromWishlistService(productId: string) {
  try {
    const { data } = await axiosInstance.delete(`/api/wishlist/${productId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'removeFromWishlist error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function clearWishlistService() {
  try {
    const { data } = await axiosInstance.delete('/api/wishlist');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('clearWishlist error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
