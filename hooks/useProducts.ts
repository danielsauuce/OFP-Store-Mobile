import { useMemo } from 'react';

interface Product {
  _id: string;
  name: string;
  category: string;
}

export function useProducts<T extends Product>(products: T[], category: string, search: string): T[] {
  return useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'all' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, category, search]);
}
