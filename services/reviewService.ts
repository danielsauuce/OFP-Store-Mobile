import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

// Public
export async function getProductReviewsService(productId: string, params: Record<string, unknown> = {}) {
  try {
    const { data } = await axiosInstance.get(`/api/reviews/product/${productId}`, { params });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getProductReviews error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

// Authenticated User

export async function createReviewService(reviewData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.post('/api/reviews', reviewData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('createReview error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateReviewService(reviewId: string, reviewData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.put(`/api/reviews/${reviewId}`, reviewData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateReview error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function deleteReviewService(reviewId: string) {
  try {
    const { data } = await axiosInstance.delete(`/api/reviews/${reviewId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('deleteReview error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
