import React from 'react';

type StripeProviderProps = {
  children: React.ReactNode;
  publishableKey?: string;
};

type StripeError = {
  code?: string;
  message: string;
};

type StripeResult = Promise<{ error: StripeError | null }>;

export function StripeProvider({ children }: StripeProviderProps) {
  return <>{children}</>;
}

export function useStripe() {
  const unavailable = async (...args: unknown[]): StripeResult => {
    void args;
    return {
      error: {
        code: 'StripeUnavailable',
        message: 'Card payments require a development build with Stripe installed.',
      },
    };
  };

  return {
    initPaymentSheet: unavailable,
    presentPaymentSheet: unavailable,
  };
}
