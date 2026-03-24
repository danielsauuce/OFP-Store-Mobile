import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryChips from '@/components/product/CategoryChips';
import { getAllProductsService } from '@/services/productService';
import { getAllCategoriesService } from '@/services/categoryService';
import ShopHeader from '@/components/shop/ShopHeader';
import EmptyProducts from '@/components/shop/EmptyProducts';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockQuantity: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ALL_CATEGORY = { id: 'all', name: 'All', slug: 'all' };

export default function ShopScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([ALL_CATEGORY]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProductsService(), getAllCategoriesService()])
      .then(([prodRes, catRes]) => {
        const prodList = prodRes?.products ?? prodRes?.data ?? prodRes;
        setAllProducts(Array.isArray(prodList) ? prodList : []);
        const catList = catRes?.categories ?? catRes?.data ?? catRes;
        const cats: Category[] = (Array.isArray(catList) ? catList : []).map(
          (c: { _id: string; name: string; slug: string }) => ({
            id: c._id,
            name: c.name,
            slug: c.slug,
          }),
        );
        setCategories([ALL_CATEGORY, ...cats]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useProducts(allProducts, selectedCategory, search);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ShopHeader search={search} onSearchChange={setSearch} />
      <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {loading ? (
        <ActivityIndicator color={colors.primary} className="mt-10" />
      ) : filtered.length === 0 ? (
        <EmptyProducts />
      ) : (
        <ProductGrid products={filtered} onPress={(id) => router.push(`/product/${id}`)} />
      )}
    </SafeAreaView>
  );
}
