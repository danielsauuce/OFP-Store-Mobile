import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
// import { useStripe } from '@stripe/stripe-react-native'; // requires native build
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCreatePayload } from '@/services/orderService';
import { createPaymentIntentService, confirmPaymentSuccessService } from '@/services/paymentService';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import AddressStep, { ShippingAddress } from '@/components/checkout/AddressStep';
import PaymentStep, { PaymentMethod } from '@/components/checkout/PaymentStep';
import ReviewStep from '@/components/checkout/ReviewStep';

const TOTAL_STEPS = 3;

const STEP_LABELS: Record<number, string> = {
  1: 'Continue to Payment',
  2: 'Review Order',
  3: 'Place Order',
};

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { createOrder } = useOrders();
  // const { initPaymentSheet, presentPaymentSheet } = useStripe(); // requires native build
  type StripeError = { code: string; message: string };
  const initPaymentSheet = async (_opts: unknown): Promise<{ error: StripeError | null }> => ({
    error: null,
  });
  const presentPaymentSheet = async (): Promise<{ error: StripeError | null }> => ({ error: null });
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
    note: '',
  });

  const [orderNotes, setOrderNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_on_delivery');

  const items = cart?.items ?? [];

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    if (field === 'note') {
      setOrderNotes(value);
      return;
    }
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    const required: (keyof ShippingAddress)[] = [
      'fullName',
      'email',
      'phone',
      'street',
      'city',
      'postalCode',
      'country',
    ];
    const missing = required.filter((f) => !address[f].trim());
    if (missing.length > 0) {
      Alert.alert('Missing Details', 'Please fill in all required address fields.');
      return false;
    }
    if (!address.email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleCardPayment = async (orderId: string): Promise<boolean> => {
    // 1. Create payment intent on server
    const { clientSecret, paymentIntentId } = await createPaymentIntentService(orderId);

    // 2. Initialise Stripe payment sheet
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Olayinka Furniture Palace',
      defaultBillingDetails: {
        name: address.fullName,
        email: address.email,
        phone: address.phone,
        address: {
          line1: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'GB',
        },
      },
      appearance: { colors: { primary: '#6366f1' } },
    });

    if (initError) {
      Alert.alert('Payment Error', initError.message);
      return false;
    }

    // 3. Present the Stripe payment sheet to the user
    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code !== 'Canceled') {
        Alert.alert('Payment Failed', presentError.message);
      }
      return false;
    }

    // 4. Notify server that payment succeeded (webhook is fallback)
    await confirmPaymentSuccessService(paymentIntentId);
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && !validateAddress()) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // Step 3 — place order
    setPlacing(true);
    try {
      const payload: OrderCreatePayload = {
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          ...(i.variantSku ? { variantSku: i.variantSku } : {}),
        })),
        shippingAddress: {
          fullName: address.fullName,
          email: address.email,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod,
        ...(orderNotes.trim() ? { notes: orderNotes.trim() } : {}),
      };

      const order = await createOrder(payload);

      // Card payment — open Stripe sheet before navigating away
      if (paymentMethod === 'card') {
        const paid = await handleCardPayment(order._id);
        if (!paid) {
          // Payment was cancelled or failed — order exists but not paid.
          // Stay on review screen so the user can retry or change method.
          setPlacing(false);
          return;
        }
      }

      await clearCart();
      router.replace(`/order-confirmation?orderId=${order._id}`);
    } catch {
      Alert.alert('Order Failed', 'Something went wrong placing your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <TouchableOpacity
          onPress={handleBack}
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>
          Checkout
        </Text>
      </View>

      {/* Stepper */}
      <CheckoutStepper currentStep={step} />

      {/* Step Content */}
      <View className="flex-1">
        {step === 1 && <AddressStep address={address} onChange={handleAddressChange} />}
        {step === 2 && <PaymentStep selected={paymentMethod} onSelect={setPaymentMethod} />}
        {step === 3 && (
          <ReviewStep
            items={items}
            subtotal={cart?.total ?? 0}
            address={address}
            paymentMethod={paymentMethod}
          />
        )}
      </View>

      {/* Bottom CTA */}
      <View
        className="px-5 pt-4 pb-6 border-t"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <TouchableOpacity
          onPress={handleNext}
          disabled={placing}
          className="h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: placing ? colors.primary + '80' : colors.primary }}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {step === TOTAL_STEPS && paymentMethod === 'card' ? 'Pay with Card' : STEP_LABELS[step]}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
