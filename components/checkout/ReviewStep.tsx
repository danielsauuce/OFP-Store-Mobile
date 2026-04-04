import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Banknote, Building2, CreditCard } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';
import type { ShippingAddress } from './AddressStep';
import type { PaymentMethod } from './PaymentStep';

const SHIPPING_FEE = 15;

interface CartItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    primaryImage?: { secureUrl?: string; url?: string };
  };
  quantity: number;
  priceSnapshot: number;
}

interface Props {
  items: CartItem[];
  subtotal: number;
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pay_on_delivery: 'Pay on Delivery',
  bank: 'Bank Transfer',
  card: 'Credit / Debit Card',
};

export default function ReviewStep({ items, subtotal, address, paymentMethod }: Props) {
  const { colors } = useTheme();
  const total = subtotal + SHIPPING_FEE;

  const getPaymentIcon = () => {
    if (paymentMethod === 'pay_on_delivery') return <Banknote size={16} color={colors.primary} />;
    if (paymentMethod === 'card') return <CreditCard size={16} color={colors.primary} />;
    return <Building2 size={16} color={colors.primary} />;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-2">
      {/* Delivery Address */}
      <Text className="text-base font-bold mb-3" style={{ color: colors.text }}>
        Order Review
      </Text>

      <View
        className="rounded-2xl border p-4 mb-3"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center gap-2 mb-2">
          <MapPin size={15} color={colors.primary} />
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.primary }}>
            Delivering To
          </Text>
        </View>
        <Text className="font-semibold text-sm" style={{ color: colors.text }}>
          {address.fullName}
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
          {address.street}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {address.city}, {address.state} {address.postalCode}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {address.country}
        </Text>
        {address.note ? (
          <Text className="text-xs mt-2 italic" style={{ color: colors.textTertiary }}>
            "{address.note}"
          </Text>
        ) : null}
      </View>

      {/* Payment Method */}
      <View
        className="rounded-2xl border p-4 mb-3 flex-row items-center gap-3"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          {getPaymentIcon()}
        </View>
        <View>
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.primary }}>
            Payment
          </Text>
          <Text className="font-semibold text-sm mt-0.5" style={{ color: colors.text }}>
            {PAYMENT_LABELS[paymentMethod]}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View
        className="rounded-2xl border p-4 mb-3"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: colors.primary }}>
          Items ({items.length})
        </Text>
        <View className="gap-3">
          {items.map((item, index) => {
            const imageUri =
              item.product.images?.[0] ??
              item.product.primaryImage?.secureUrl ??
              item.product.primaryImage?.url;
            return (
              <View key={item.product._id ?? index} className="flex-row items-center gap-3">
                <View
                  className="w-14 h-14 rounded-xl overflow-hidden"
                  style={{ backgroundColor: colors.border }}
                >
                  {imageUri && <Image source={{ uri: imageUri }} className="w-14 h-14" contentFit="cover" />}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" numberOfLines={1} style={{ color: colors.text }}>
                    {item.product.name}
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    Qty: {item.quantity}
                  </Text>
                </View>
                <Text className="font-bold text-sm" style={{ color: colors.primary }}>
                  {formatCurrency(item.priceSnapshot * item.quantity)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Pricing */}
      <View
        className="rounded-2xl border p-4 mb-3 gap-2"
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
        <View className="h-px my-1" style={{ backgroundColor: colors.border }} />
        <View className="flex-row justify-between">
          <Text className="font-bold text-base" style={{ color: colors.text }}>
            Total
          </Text>
          <Text className="font-bold text-base" style={{ color: colors.primary }}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
