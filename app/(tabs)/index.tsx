import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProductsService } from '@/services/productService';
import { normalizeProduct, NormalizedProduct } from '@/utils/normalizeProduct';
import HomeHeader from '@/components/home/HomeHeader';
import HeroBanner from '@/components/home/HeroBanner';
import QualityHighlights from '@/components/home/QualityHighlights';
import FeaturedProducts from '@/components/home/FeaturedProducts';

type Product = NormalizedProduct;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: featured = [],
    isLoading: loading,
    isError: error,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await getAllProductsService({ limit: 6 });
      const list = res?.data?.products ?? res?.products ?? res?.data ?? res;
      return Array.isArray(list) ? list.map(normalizeProduct) : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader
          firstName={user?.fullName.split(' ')[0] ?? null}
          onCartPress={() => router.push('/(tabs)/cart')}
        />
        <HeroBanner onShopPress={() => router.push('/(tabs)/shop')} />
        <QualityHighlights />
        <FeaturedProducts
          products={featured}
          loading={loading}
          error={error}
          onRetry={refetch}
          onSeeAllPress={() => router.push('/(tabs)/shop')}
          onProductPress={(id) => router.push(`/product/${id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
