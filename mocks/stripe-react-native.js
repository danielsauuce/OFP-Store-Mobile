/**
 * Expo Go stub for @stripe/stripe-react-native.
 * Used when EXPO_GO=true (npx expo start without a dev client).
 * All payment actions are no-ops — Stripe requires a native build to work.
 */
const React = require('react');

const StripeProvider = ({ children }) => children ?? null;
StripeProvider.displayName = 'StripeProvider (stub)';

const useStripe = () => ({
  initPaymentSheet: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
  presentPaymentSheet: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
  confirmPaymentSheetPayment: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
  confirmPayment: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
  createPaymentMethod: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
  handleNextAction: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
  retrievePaymentIntent: async () => ({ error: { message: 'Stripe not available in Expo Go' } }),
});

module.exports = {
  StripeProvider,
  useStripe,
};
