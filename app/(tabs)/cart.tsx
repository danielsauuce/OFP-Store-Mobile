import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';
import CartItem from '@/components/cart/CartItem';
import {
  getCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from '@/services/cartService';

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItemData {
  _id: string;
  product: CartProduct;
  quantity: number;
}

interface Cart {
  items: CartItemData[];
  subtotal: number;
}

const SHIPPING_FEE = 15;

export default function CartScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await getCartService();
      setCart(res.cart ?? res ?? null);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdate = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItemService(productId, quantity);
      await fetchCart();
    } catch {
      Alert.alert('Error', 'Could not update item');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeCartItemService(productId);
      await fetchCart();
    } catch {
      Alert.alert('Error', 'Could not remove item');
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearCartService();
            await fetchCart();
          } catch {
            Alert.alert('Error', 'Could not clear cart');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const subtotal = cart?.subtotal ?? items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row justify-between items-center">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Cart
        </Text>
        {!isEmpty && (
          <TouchableOpacity onPress={handleClear}>
            <Text className="text-sm font-semibold" style={{ color: colors.error }}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center gap-4">
          <ShoppingCart size={64} color={colors.textTertiary} />
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Your cart is empty
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Add items to get started
          </Text>
          <TouchableOpacity
            className="px-8 py-3 rounded-2xl mt-2"
            style={{ backgroundColor: colors.primary }}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text className="text-white font-semibold">Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdate={(qty) => handleUpdate(item.product._id, qty)}
                onRemove={() => handleRemove(item.product._id)}
              />
            ))}
          </ScrollView>

          {/* Order summary */}
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
              onPress={() => Alert.alert('Checkout', 'Checkout coming soon!')}
            >
              <Text className="text-white font-bold text-base">Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
