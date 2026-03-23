import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from '@/services/cartService';

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantSku?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getCartService();
      setCart(res.cart ?? res ?? null);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Re-fetch whenever auth state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number = 1, variantSku?: string) => {
    await addToCartService(productId, quantity, variantSku ?? null);
    await fetchCart();
  };

  const updateItem = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItemService(productId, quantity);
    await fetchCart();
  };

  const removeItem = async (productId: string) => {
    await removeCartItemService(productId);
    await fetchCart();
  };

  const clearCart = async () => {
    await clearCartService();
    await fetchCart();
  };

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, fetchCart, addToCart, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
