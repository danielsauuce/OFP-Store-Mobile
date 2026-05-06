import { useMemo } from 'react';
import type { SortOption } from '@/components/shop/FilterSheet';

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface UseProductsOptions {
  sort?: SortOption;
}

// Client-side sort only. Filtering (category, search, price) is handled server-side.
export function useProducts<T extends Product>(
  products: T[],
  _category: string,
  _search: string,
  options: UseProductsOptions = {},
): T[] {
  const { sort = 'newest' } = options;

  return useMemo(() => {
    if (sort === 'newest') return products; // server already returns newest-first

    return [...products].sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [products, sort]);
}
