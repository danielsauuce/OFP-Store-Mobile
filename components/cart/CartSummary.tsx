import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';

const FREE_SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING_FEE = 15;

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}

export default function CartSummary({ subtotal, onCheckout }: CartSummaryProps) {
  const { colors } = useTheme();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 28,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderColor: colors.border,
        gap: 12,
      }}
    >
      {/* Promo Code Section */}
      <TouchableOpacity
        onPress={() => setPromoExpanded(!promoExpanded)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Tag size={16} color={colors.primary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Promo Code</Text>
        </View>
        {promoExpanded ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {promoExpanded && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          style={{ flexDirection: 'row', gap: 8 }}
        >
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Enter promo code"
            placeholderTextColor={colors.textTertiary}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              fontSize: 13,
              color: colors.text,
              backgroundColor: colors.background,
            }}
          />
          <TouchableOpacity
            style={{
              height: 42,
              paddingHorizontal: 18,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Apply</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* Order Total */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>Order Total</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
          {formatCurrency(subtotal)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>Shipping</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
          {shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}
        </Text>
      </View>

      {/* Total Amount */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 4,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Total Amount</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.primary }}>
          {formatCurrency(total)}
        </Text>
      </View>

      {/* Proceed to Payment */}
      <TouchableOpacity
        onPress={onCheckout}
        style={{
          height: 54,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}
