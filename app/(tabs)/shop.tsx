import React, { useState } from 'react';
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

export default function ShopScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: allProducts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const res = await getAllProductsService();
      const list = res?.data?.products ?? res?.products ?? res?.data ?? res;
      return Array.isArray(list) ? list.map(normalizeProduct) : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [ALL_CATEGORY] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getAllCategoriesService();
      const catList = res?.categories ?? res?.data ?? res;
      const cats: Category[] = (Array.isArray(catList) ? catList : []).map(
        (c: { _id: string; name: string; slug: string }) => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
        }),
      );
      return [ALL_CATEGORY, ...cats];
    },
    staleTime: 10 * 60 * 1000,
  });

  const minPrice = filters.minPrice !== '' ? parseFloat(filters.minPrice) : undefined;
  const maxPrice = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : undefined;

  const filtered = useProducts(allProducts, selectedCategory, search, {
    sort: filters.sort,
    minPrice,
    maxPrice,
  });

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
      ) : filtered.length === 0 ? (
        <EmptyProducts />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProductGrid products={filtered} onPress={(id) => router.push(`/product/${id}`)} />
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
