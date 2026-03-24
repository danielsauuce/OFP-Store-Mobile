import { useMemo } from 'react';
import type { SortOption } from '@/components/shop/FilterSheet';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
}

interface UseProductsOptions {
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
}

export function useProducts<T extends Product>(
  products: T[],
  category: string,
  search: string,
  options: UseProductsOptions = {},
): T[] {
  const { sort = 'newest', minPrice, maxPrice } = options;

  return useMemo(() => {
    let result = products.filter((p) => {
      const matchCategory = category === 'all' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchMin = minPrice === undefined || p.price >= minPrice;
      const matchMax = maxPrice === undefined || p.price <= maxPrice;
      return matchCategory && matchSearch && matchMin && matchMax;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return 0; // preserve server order (newest first from API)
      }
    });

    return result;
  }, [products, category, search, sort, minPrice, maxPrice]);
}
