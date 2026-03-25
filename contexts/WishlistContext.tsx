import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  clearWishlistService,
} from '@/services/wishlistService';

export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  inStock: boolean;
  category: string;
}

export interface WishlistItem {
  _id: string;
  product: WishlistProduct;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getWishlistService();
      setItems(res.wishlist?.items ?? res.items ?? res ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    try {
      await addToWishlistService(productId);
      await fetchWishlist();
    } catch (err) {
      console.error('addToWishlist error:', err);
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlistService(productId);
      await fetchWishlist();
    } catch (err) {
      console.error('removeFromWishlist error:', err);
      throw err;
    }
  };

  const clearWishlist = async () => {
    try {
      await clearWishlistService();
      setItems([]);
    } catch (err) {
      console.error('clearWishlist error:', err);
      throw err;
    }
  };

  const isInWishlist = (productId: string) => items.some((i) => i.product._id === productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};
