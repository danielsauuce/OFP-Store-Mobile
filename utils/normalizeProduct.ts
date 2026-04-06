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

  // primaryImage is always first; images array provides additional gallery entries
  const primaryUrl = p.primaryImage ? resolveImageUrl(p.primaryImage) : '';
  const extraUrls = (p.images ?? []).map(resolveImageUrl).filter(Boolean);

  const seen = new Set<string>();
  const images: string[] = [];
  for (const url of [primaryUrl, ...extraUrls]) {
    if (url && !seen.has(url)) {
      seen.add(url);
      images.push(url);
    }
  }

  return { ...p, category, images };
}
