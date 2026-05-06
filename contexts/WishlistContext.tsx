import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  clearWishlistService,
} from '@/services/wishlistService';
import { normalizeProduct } from '@/utils/normalizeProduct';

export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  inStock: boolean;
  category: string;
  imageUrl?: string;
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
      // API: { wishlist: { products: [...] } } — products are direct product objects
      const rawProducts: unknown[] =
        res.wishlist?.products ??
        res.wishlist?.items?.map((i: { product: unknown }) => i.product) ??
        res.products ??
        (Array.isArray(res) ? res : []);
      if (!Array.isArray(rawProducts)) return [];
      return rawProducts.map((p) => {
        const raw = p as Record<string, unknown>;

        // Extract image URL directly from the populated primaryImage object.
        // The backend populates primaryImage with { secureUrl, publicId, url } via .lean(),
        // so we read it here before normalizeProduct's type-narrowing can discard it.
        const pi = raw.primaryImage as
          | { secureUrl?: string; secure_url?: string; url?: string }
          | string
          | null
          | undefined;
        const imageUrl =
          typeof pi === 'string'
            ? pi || undefined
            : pi?.secureUrl ?? pi?.secure_url ?? pi?.url ?? undefined;

        const normalized = normalizeProduct(p as Parameters<typeof normalizeProduct>[0]);

        // Ensure the resolved URL is always first in the images array.
        const images =
          imageUrl && !normalized.images.includes(imageUrl)
            ? [imageUrl, ...normalized.images]
            : normalized.images.length > 0
              ? normalized.images
              : imageUrl
                ? [imageUrl]
                : [];

        return {
          _id: normalized._id,
          product: { ...normalized, images, imageUrl } as WishlistProduct,
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
