import axiosInstance from './axiosInstance';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export const createPaymentIntentService = async (orderId: string): Promise<PaymentIntentResponse> => {
  const { data } = await axiosInstance.post('/api/payments/create-payment-intent', { orderId });
  return data;
};

export const confirmPaymentSuccessService = async (stripePaymentIntentId: string): Promise<void> => {
  try {
    await axiosInstance.post('/api/payments/confirm-success', { stripePaymentIntentId });
  } catch {
    // Non-critical — the Stripe webhook handles this as a fallback
  }
};
