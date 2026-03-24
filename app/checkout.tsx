import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
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
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.fullName ?? '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    const required: (keyof ShippingAddress)[] = ['fullName', 'street', 'city', 'postalCode', 'country'];
    const missing = required.filter((f) => !address[f].trim());
    if (missing.length > 0) {
      Alert.alert('Missing Details', 'Please fill in all required address fields.');
      return false;
    }
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
      const order = await createOrder({
        shippingAddress: {
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod,
        ...(address.note.trim() ? { note: address.note.trim() } : {}),
      });

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
          <ReviewStep items={items} subtotal={subtotal} address={address} paymentMethod={paymentMethod} />
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
            <Text className="text-white font-bold text-base">{STEP_LABELS[step]}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
