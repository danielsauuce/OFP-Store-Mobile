import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Armchair } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryChips from '@/components/product/CategoryChips';
import { getAllProductsService } from '@/services/productService';
import { getAllCategoriesService } from '@/services/categoryService';

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
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
          Shop
        </Text>

        {/* Search */}
        <View
          className="flex-row items-center px-4 h-12 rounded-2xl gap-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor={colors.textTertiary}
            className="flex-1 text-sm"
            style={{ color: colors.text }}
          />
        </View>
      </View>

      {/* Category chips */}
      <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Products */}
      {loading ? (
        <ActivityIndicator color={colors.primary} className="mt-10" />
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <Armchair size={56} color={colors.textTertiary} />
          <Text className="font-semibold text-lg" style={{ color: colors.text }}>
            No products found
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Try adjusting your search or filter
          </Text>
        </View>
      ) : (
        <ProductGrid products={filtered} onPress={(id) => router.push(`/product/${id}`)} />
      )}
    </SafeAreaView>
  );
}
