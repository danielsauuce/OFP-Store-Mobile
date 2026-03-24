import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import CartItem from '@/components/cart/CartItem';
import CartHeader from '@/components/cart/CartHeader';
import EmptyCart from '@/components/cart/EmptyCart';
import CartSummary from '@/components/cart/CartSummary';
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <CartHeader showClearAll={!isEmpty} onClearAll={handleClear} />

      {isEmpty ? (
        <EmptyCart onShopPress={() => router.push('/(tabs)/shop')} />
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
          <CartSummary subtotal={subtotal} />
        </>
      )}
    </SafeAreaView>
  );
}
