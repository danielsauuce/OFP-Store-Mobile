import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryChips from '@/components/product/CategoryChips';
import { getAllProductsService } from '@/services/productService';
import { getAllCategoriesService } from '@/services/categoryService';
import ShopHeader from '@/components/shop/ShopHeader';
import EmptyProducts from '@/components/shop/EmptyProducts';
import FilterSheet, { DEFAULT_FILTERS, FilterState } from '@/components/shop/FilterSheet';
import { normalizeProduct, NormalizedProduct } from '@/utils/normalizeProduct';
import SkeletonProductGrid from '@/components/ui/SkeletonProductGrid';

type Product = NormalizedProduct;

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ALL_CATEGORY = { id: 'all', name: 'All', slug: 'all' };
const SEARCH_DEBOUNCE_MS = 400;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ShopScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // selectedCategory stores the category slug ('all' or e.g. 'sofas')
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const minPrice = filters.minPrice !== '' ? parseFloat(filters.minPrice) : undefined;
  const maxPrice = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : undefined;

  // Products are fetched server-side with all active filters.
  // The backend supports category (slug), search, minPrice, maxPrice, and limit.
  // Sort is applied client-side because the backend does not expose a sort param.
  const {
    data: allProducts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ['products', { category: selectedCategory, search: debouncedSearch, minPrice, maxPrice }],
    queryFn: async () => {
      const params: Record<string, unknown> = { limit: 100 };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;

      const res = await getAllProductsService(params);
      const list = res?.data?.products ?? res?.products ?? res?.data ?? res;
      return Array.isArray(list) ? list.map(normalizeProduct) : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Category list uses slug as id so CategoryChips sends a usable API key
  const { data: categories = [ALL_CATEGORY] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getAllCategoriesService();
      const catList = res?.categories ?? res?.data ?? res;
      const cats: Category[] = (Array.isArray(catList) ? catList : []).map(
        (c: { _id: string; name: string; slug: string }) => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
        }),
      );
      return [ALL_CATEGORY, ...cats];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Client-side sort only (server doesn't expose a sort param)
  const sorted = useProducts(allProducts, 'all', '', { sort: filters.sort });

  const activeFilterCount =
    (filters.sort !== 'newest' ? 1 : 0) +
    (filters.minPrice !== '' ? 1 : 0) +
    (filters.maxPrice !== '' ? 1 : 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ShopHeader
        search={search}
        onSearchChange={setSearch}
        activeFilterCount={activeFilterCount}
        onFilterPress={() => setShowFilters(true)}
      />
      <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <SkeletonProductGrid count={6} />
        </ScrollView>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="font-semibold text-lg" style={{ color: colors.text }}>
            Could not load products
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sorted.length === 0 ? (
        <EmptyProducts />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProductGrid products={sorted} onPress={(id) => router.push(`/product/${id}`)} />
        </ScrollView>
      )}

      <FilterSheet
        visible={showFilters}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
