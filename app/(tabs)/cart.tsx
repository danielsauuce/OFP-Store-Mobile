import React from 'react';
import { ScrollView, Alert, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartHeader from '@/components/cart/CartHeader';
import EmptyCart from '@/components/cart/EmptyCart';
import CartSummary from '@/components/cart/CartSummary';

export default function CartScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { cart, loading, fetchCart, updateItem, removeItem, clearCart } = useCart();

  const handleUpdate = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateItem(productId, quantity);
    } catch {
      Alert.alert('Error', 'Could not update item');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
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
            await clearCart();
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

  if (!cart && !loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center gap-3"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="font-semibold text-lg" style={{ color: colors.text }}>
          Could not load cart
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          onPress={fetchCart}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const subtotal =
    cart?.subtotal ?? items.reduce((sum, i) => sum + (i.price ?? i.product.price) * i.quantity, 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <CartHeader showClearAll={!isEmpty} onClearAll={handleClear} />

      {isEmpty ? (
        <EmptyCart onShopPress={() => router.push('/(tabs)/shop')} />
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {items.map((item, index) => (
              <CartItem
                key={item._id ?? item.product?._id ?? index}
                item={item}
                index={index}
                onUpdate={(qty) => handleUpdate(item.product._id, qty)}
                onRemove={() => handleRemove(item.product._id)}
              />
            ))}
          </ScrollView>
          <CartSummary subtotal={subtotal} onCheckout={() => router.push('/checkout')} />
        </>
      )}
    </SafeAreaView>
  );
}
