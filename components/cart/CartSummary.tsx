import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';

const SHIPPING_FEE = 15;

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}

export default function CartSummary({ subtotal, onCheckout }: CartSummaryProps) {
  const { colors } = useTheme();
  const total = subtotal + SHIPPING_FEE;

  return (
    <View
      className="px-5 pt-4 pb-6 gap-3 rounded-t-3xl border-t"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row justify-between">
        <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
        <Text className="font-semibold" style={{ color: colors.text }}>
          {formatCurrency(subtotal)}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text style={{ color: colors.textSecondary }}>Shipping</Text>
        <Text className="font-semibold" style={{ color: colors.text }}>
          {formatCurrency(SHIPPING_FEE)}
        </Text>
      </View>
      <View className="h-px" style={{ backgroundColor: colors.border }} />
      <View className="flex-row justify-between">
        <Text className="font-bold text-base" style={{ color: colors.text }}>
          Total
        </Text>
        <Text className="font-bold text-base" style={{ color: colors.primary }}>
          {formatCurrency(total)}
        </Text>
      </View>
      <TouchableOpacity
        className="h-14 rounded-2xl items-center justify-center mt-1"
        style={{ backgroundColor: colors.primary }}
        onPress={onCheckout}
      >
        <Text className="text-white font-bold text-base">Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}
