import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  priceSnapshot: number; // price locked at time of adding to cart
  variantSku?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantSku?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number, variantSku?: string) => Promise<void>;
  removeItem: (productId: string, variantSku?: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const cartKeys = {
  cart: ['cart'] as const,
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: cartKeys.cart });
    }
  }, [user, queryClient]);

  const { data, isLoading } = useQuery<Cart | null>({
    queryKey: cartKeys.cart,
    queryFn: async () => {
      const res = await getCartService();
      const raw = res.cart ?? res ?? null;
      if (!raw) return null;

      type RawItem = {
        _id: string;
        product: CartProduct & { primaryImage?: { secure_url?: string; secureUrl?: string; url?: string } };
        quantity: number;
        priceSnapshot?: number;
        price?: number;
        imageSnapshot?: string;
        variantSku?: string;
      };

      // Normalize each item — backend returns priceSnapshot as locked price
      const items: CartItem[] = (raw.items ?? []).map((item: RawItem) => {
        const p = item.product;
        let images: string[] = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
          images = p.images.map((img: string | { secure_url?: string; secureUrl?: string; url?: string }) =>
            typeof img === 'string' ? img : (img.secure_url ?? img.secureUrl ?? img.url ?? ''),
          );
        } else if (item.imageSnapshot) {
          images = [item.imageSnapshot];
        } else if (p.primaryImage?.secure_url) {
          images = [p.primaryImage.secure_url];
        } else if (p.primaryImage?.secureUrl) {
          images = [p.primaryImage.secureUrl];
        } else if (p.primaryImage?.url) {
          images = [p.primaryImage.url];
        }
        const priceSnapshot = item.priceSnapshot ?? item.price ?? p.price ?? 0;
        return {
          _id: item._id,
          product: { ...p, images },
          quantity: item.quantity,
          priceSnapshot,
          variantSku: item.variantSku,
        };
      });

      return { items, total: raw.total ?? raw.subtotal ?? 0 };
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000,
  });

  const fetchCart = async () => {
    await queryClient.invalidateQueries({ queryKey: cartKeys.cart });
  };

  const addMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantSku,
    }: {
      productId: string;
      quantity: number;
      variantSku: string | null;
    }) => addToCartService(productId, quantity, variantSku),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.cart }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantSku,
    }: {
      productId: string;
      quantity: number;
      variantSku?: string;
    }) => updateCartItemService(productId, quantity, variantSku),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.cart }),
  });

  const removeMutation = useMutation({
    mutationFn: ({ productId, variantSku }: { productId: string; variantSku?: string }) =>
      removeCartItemService(productId, variantSku),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.cart }),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearCartService(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.cart }),
  });

  const addToCart = async (productId: string, quantity: number = 1, variantSku?: string) => {
    try {
      await addMutation.mutateAsync({ productId, quantity, variantSku: variantSku ?? null });
    } catch (err) {
      throw new Error(`Failed to add product to cart: ${err instanceof Error ? err.message : err}`);
    }
  };

  const updateItem = async (productId: string, quantity: number, variantSku?: string) => {
    if (quantity < 1) throw new RangeError('quantity must be >= 1');
    try {
      await updateMutation.mutateAsync({ productId, quantity, variantSku });
    } catch (err) {
      if (err instanceof RangeError) throw err;
      throw new Error(`Failed to update cart item: ${err instanceof Error ? err.message : err}`);
    }
  };

  const removeItem = async (productId: string, variantSku?: string) => {
    try {
      await removeMutation.mutateAsync({ productId, variantSku });
    } catch (err) {
      throw new Error(`Failed to remove cart item: ${err instanceof Error ? err.message : err}`);
    }
  };

  const clearCart = async () => {
    try {
      await clearMutation.mutateAsync();
    } catch (err) {
      throw new Error(`Failed to clear cart: ${err instanceof Error ? err.message : err}`);
    }
  };

  const cart: Cart | null = user ? (data ?? null) : null;
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const loading = isLoading;

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
