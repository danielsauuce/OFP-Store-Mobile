import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

interface OrderStatusBody {
  orderStatus: string;
  note?: string;
}

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

// Admin Endpoints
export async function getAllOrdersAdminService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/orders/admin', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getAllOrdersAdmin error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateOrderStatusAdminService(orderId: string, orderStatus: string, note?: string) {
  try {
    const body: OrderStatusBody = { orderStatus };
    if (note) body.note = note;

    const { data } = await axiosInstance.patch(`/api/orders/admin/${orderId}/status`, body);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'updateOrderStatusAdmin error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}
