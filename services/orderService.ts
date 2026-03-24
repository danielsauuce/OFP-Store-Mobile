import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

interface OrderParams {
  page?: number;
  limit?: number;
  status?: string;
}

// User Endpoints
export async function createOrderService(orderData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.post('/api/orders', orderData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('createOrder error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getUserOrdersService(page: number = 1, limit: number = 10, status?: string) {
  try {
    const params: OrderParams = { page, limit };
    if (status) params.status = status;

    const { data } = await axiosInstance.get('/api/orders', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getUserOrders error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getOrderByIdService(orderId: string) {
  try {
    const { data } = await axiosInstance.get(`/api/orders/${orderId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getOrderById error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function cancelOrderService(orderId: string) {
  try {
    const { data } = await axiosInstance.patch(`/api/orders/${orderId}/cancel`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('cancelOrder error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
