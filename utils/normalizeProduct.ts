type CloudinaryImage = { secure_url?: string; secureUrl?: string; url?: string };

interface RawProduct {
  _id: string;
  name: string;
  price: number;
  // images may be strings, camelCase objects, or snake_case Cloudinary objects
  images?: (string | CloudinaryImage)[];
  primaryImage?: CloudinaryImage;
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

function resolveImageUrl(img: string | CloudinaryImage): string {
  if (typeof img === 'string') return img;
  return img.secure_url ?? img.secureUrl ?? img.url ?? '';
}

export function normalizeProduct(p: RawProduct): NormalizedProduct {
  const category = typeof p.category === 'string' ? p.category : (p.category?.name ?? '');

  let images: string[] = [];
  if (p.images && p.images.length > 0) {
    images = p.images.map(resolveImageUrl).filter(Boolean);
  } else if (p.primaryImage) {
    const url = resolveImageUrl(p.primaryImage);
    if (url) images = [url];
  }

  return { ...p, category, images };
}
