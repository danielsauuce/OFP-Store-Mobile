import { useMemo } from 'react';

export function useProducts(products, category, search) {
  return useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'all' || p.category === category;

      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [products, category, search]);
}
