import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ShoppingBag, ClipboardList } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';

export default function OrderConfirmationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const shortId = orderId ? `#${orderId.slice(-8).toUpperCase()}` : '';

  return (
    <SafeAreaView
      className="flex-1 items-center justify-between px-6 py-8"
      style={{ backgroundColor: colors.background }}
    >
      {/* Top spacer */}
      <View className="flex-1" />

      {/* Success Icon */}
      <View className="items-center gap-5">
        <View
          className="w-28 h-28 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.success + '18' }}
        >
          <CheckCircle2 size={64} color={colors.success} strokeWidth={1.5} />
        </View>

        <View className="items-center gap-2">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Order Placed!
          </Text>
          <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
            Thank you for your order. We'll get it{'\n'}ready and on its way soon.
          </Text>
        </View>

        {/* Order card */}
        <View
          className="w-full rounded-2xl border p-5 gap-4 mt-2"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <View className="flex-row justify-between items-center">
            <Text
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.textSecondary }}
            >
              Order ID
            </Text>
            <Text className="font-bold text-sm" style={{ color: colors.primary }}>
              {shortId}
            </Text>
          </View>

          <View className="h-px" style={{ backgroundColor: colors.border }} />

          <View className="flex-row justify-between items-center">
            <Text
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.textSecondary }}
            >
              Status
            </Text>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.success + '18' }}>
              <Text className="text-xs font-bold" style={{ color: colors.success }}>
                Confirmed
              </Text>
            </View>
          </View>

          <View className="h-px" style={{ backgroundColor: colors.border }} />

          <View className="flex-row justify-between items-center">
            <Text
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.textSecondary }}
            >
              Estimated Delivery
            </Text>
            <Text className="font-semibold text-sm" style={{ color: colors.text }}>
              5 – 7 business days
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1" />

      {/* Actions */}
      <View className="w-full gap-3">
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/shop')}
          className="h-14 rounded-2xl items-center justify-center flex-row gap-2"
          style={{ backgroundColor: colors.primary }}
        >
          <ShoppingBag size={18} color="#fff" />
          <Text className="text-white font-bold text-base">Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/profile')}
          className="h-14 rounded-2xl items-center justify-center flex-row gap-2 border"
          style={{ borderColor: colors.primary, backgroundColor: colors.primary + '10' }}
        >
          <ClipboardList size={18} color={colors.primary} />
          <Text className="font-bold text-base" style={{ color: colors.primary }}>
            View My Orders
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
