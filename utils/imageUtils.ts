/**
 * Normalize image URL from various formats
 * Handles: string, {secure_url}, {secureUrl}, {url}
 */
export function normalizeImageUrl(
  raw: string | { secure_url?: string; secureUrl?: string; url?: string } | null | undefined,
): string | undefined {
  if (!raw) return undefined;

  if (typeof raw === 'string') {
    return raw || undefined;
  }

  if (typeof raw === 'object') {
    return raw.secure_url || raw.secureUrl || raw.url || undefined;
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
