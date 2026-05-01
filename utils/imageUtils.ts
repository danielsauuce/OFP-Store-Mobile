const API_ORIGIN = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '').replace(/\/$/, '');

function absolutizeImageUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^(https?:|file:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (!API_ORIGIN) return trimmed;
  return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Normalize image URL from various backend/media formats.
 * Handles strings, Cloudinary media objects, populated user.profilePicture objects,
 * and relative paths returned by local upload storage.
 */
export function normalizeImageUrl(raw: unknown): string | undefined {
  if (!raw) return undefined;

  if (typeof raw === 'string') {
    return absolutizeImageUrl(raw);
  }

  if (typeof raw === 'object') {
    const image = raw as Record<string, unknown>;
    const direct =
      image.secure_url ??
      image.secureUrl ??
      image.secureURL ??
      image.url ??
      image.uri ??
      image.path ??
      image.location;

    if (typeof direct === 'string') {
      return absolutizeImageUrl(direct);
    }

    for (const key of ['profilePicture', 'image', 'file', 'media', 'data', 'asset']) {
      const nested = normalizeImageUrl(image[key]);
      if (nested) return nested;
    }
  }

  return undefined;
}

/**
 * Extract product image URL with fallback chain
 * Priority:
 * 1. item.product?.primaryImage?.secureUrl || item.product?.primaryImage?.url
 * 2. item.product?.images?.[0]
 * 3. item.imageSnapshot
 */
export function extractProductImageUrl(item: {
  product?: {
    primaryImage?: { secureUrl?: string; url?: string } | string;
    images?: (string | { secure_url?: string; secureUrl?: string; url?: string })[];
  };
  imageSnapshot?: string;
}): string | undefined {
  // First try: primaryImage with normalized URL
  if (item.product?.primaryImage) {
    const primaryUrl = normalizeImageUrl(item.product.primaryImage);
    if (primaryUrl) return primaryUrl;
  }

  // Second try: first image in images array
  if (item.product?.images?.[0]) {
    const firstImageUrl = normalizeImageUrl(item.product.images[0]);
    if (firstImageUrl) return firstImageUrl;
  }

  // Last fallback: imageSnapshot
  return item.imageSnapshot;
}
