import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  clearWishlistService,
} from '@/services/wishlistService';

type CloudinaryImage = { secure_url?: string; secureUrl?: string; url?: string };

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

export const wishlistKeys = {
  list: ['wishlist'] as const,
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: wishlistKeys.list });
    }
  }, [user, queryClient]);

  const { data, isLoading } = useQuery<WishlistItem[]>({
    queryKey: wishlistKeys.list,
    queryFn: async () => {
      const res = await getWishlistService();
      // Backend may return: {wishlist:{items:[...]}} | {items:[...]} | [{product:{...}}] | {data:{items:[...]}}
      const list: WishlistItem[] =
        res.wishlist?.items ?? res.data?.items ?? res.items ?? (Array.isArray(res) ? res : []);
      if (!Array.isArray(list)) return [];
      // Normalize product images — Cloudinary may return objects instead of strings
      return list.map((item) => {
        const p = item.product as WishlistProduct & { primaryImage?: CloudinaryImage };
        const images: string[] = (p.images ?? [])
          .map((img: string | CloudinaryImage) => {
            if (typeof img === 'string') return img;
            return img.secure_url ?? img.secureUrl ?? img.url ?? '';
          })
          .filter(Boolean);
        const fallback = p.primaryImage?.secure_url ?? p.primaryImage?.secureUrl ?? p.primaryImage?.url;
        return {
          ...item,
          product: { ...p, images: images.length > 0 ? images : fallback ? [fallback] : [] },
        };
      });
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const fetchWishlist = async () => {
    await queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
  };

  const addMutation = useMutation({
    mutationFn: (productId: string) => addToWishlistService(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.list }),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlistService(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.list }),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearWishlistService(),
    onSuccess: () => queryClient.removeQueries({ queryKey: wishlistKeys.list }),
  });

  const addToWishlist = async (productId: string) => {
    try {
      await addMutation.mutateAsync(productId);
    } catch (err) {
      console.error('addToWishlist error:', err);
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await removeMutation.mutateAsync(productId);
    } catch (err) {
      console.error('removeFromWishlist error:', err);
      throw err;
    }
  };

  const clearWishlist = async () => {
    try {
      await clearMutation.mutateAsync();
    } catch (err) {
      console.error('clearWishlist error:', err);
      throw err;
    }
  };

  const items: WishlistItem[] = user ? (data ?? []) : [];
  const isInWishlist = (productId: string) => items.some((i) => i.product._id === productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading: isLoading,
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
