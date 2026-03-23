import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export {
  getAllMediaService,
  uploadImageService as uploadSingleImageService,
  uploadMultipleImagesService,
} from './uploadService';

interface OrderStatusBody {
  orderStatus: string;
  note?: string;
}

// Dashboard

export async function getDashboardStatsService() {
  try {
    const { data } = await axiosInstance.get('/api/admin/dashboard/stats');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getDashboardStats error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

// User Management

export async function getAllUsersAdminService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/admin/users', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getAllUsersAdmin error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getUserByIdAdminService(userId: string) {
  try {
    const { data } = await axiosInstance.get(`/api/admin/users/${userId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getUserByIdAdmin error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateUserStatusService(userId: string, isActive: boolean) {
  try {
    const { data } = await axiosInstance.patch(`/api/admin/users/${userId}/status`, { isActive });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateUserStatus error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateUserRoleService(userId: string, role: string) {
  try {
    const { data } = await axiosInstance.patch(`/api/admin/users/${userId}/role`, { role });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateUserRole error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function deleteUserAdminService(userId: string) {
  try {
    const { data } = await axiosInstance.delete(`/api/admin/users/delete/${userId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('deleteUserAdmin error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

// Product Management (Admin)

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

// Order Management (Admin)

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

// Category Management (Admin)

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

// Review Moderation (Admin)

export async function getAllReviewsAdminService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/reviews/admin', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'getAllReviewsAdmin error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function approveReviewService(reviewId: string, isApproved: boolean) {
  try {
    const { data } = await axiosInstance.patch(`/api/reviews/admin/${reviewId}/approve`, {
      isApproved,
    });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('approveReview error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

// Support Ticket Management (Admin)

export async function getAllTicketsAdminService(params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get('/api/support/admin', { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'getAllTicketsAdmin error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function getTicketAdminService(ticketId: string) {
  try {
    const { data } = await axiosInstance.get(`/api/support/admin/${ticketId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getTicketAdmin error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateTicketAdminService(ticketId: string, updateData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.patch(`/api/support/admin/${ticketId}`, updateData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateTicketAdmin error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function addAdminReplyService(ticketId: string, text: string) {
  try {
    const { data } = await axiosInstance.post(`/api/support/admin/${ticketId}/reply`, { text });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('addAdminReply error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
