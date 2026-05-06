import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

interface CartItemBody {
  product: string;
  quantity: number;
  variantSku?: string;
}

export async function getCartService() {
  try {
    const { data } = await axiosInstance.get('/api/cart');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getCart error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function addToCartService(
  product: string,
  quantity: number = 1,
  variantSku: string | null = null,
) {
  try {
    const body: CartItemBody = { product, quantity };
    if (variantSku) body.variantSku = variantSku;

    const { data } = await axiosInstance.post('/api/cart/items', body);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('addToCart error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateCartItemService(productId: string, quantity: number) {
  try {
    const { data } = await axiosInstance.put(`/api/cart/items/${productId}`, { quantity });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateCartItem error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function removeCartItemService(productId: string, variantSku?: string) {
  try {
    const params = variantSku ? { variantSku } : undefined;
    const { data } = await axiosInstance.delete(`/api/cart/items/${productId}`, { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('removeCartItem error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function clearCartService() {
  try {
    const { data } = await axiosInstance.delete('/api/cart');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('clearCart error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
