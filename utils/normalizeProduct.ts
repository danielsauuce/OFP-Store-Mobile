interface RawProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  primaryImage?: { secureUrl?: string; url?: string };
  category: string | { name: string; slug?: string };
  inStock: boolean;
  stockQuantity: number;
  description?: string;
  material?: string;
  dimensions?: string;
}

export interface NormalizedProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
  material?: string;
  dimensions?: string;
}

export function normalizeProduct(p: RawProduct): NormalizedProduct {
  const category = typeof p.category === 'string' ? p.category : (p.category?.name ?? '');

  const images =
    p.images?.length > 0
      ? p.images
      : p.primaryImage?.secureUrl
        ? [p.primaryImage.secureUrl]
        : p.primaryImage?.url
          ? [p.primaryImage.url]
          : [];

  return { ...p, category, images };
}
