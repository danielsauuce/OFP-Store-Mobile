import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProductsService } from '@/services/productService';
import HomeHeader from '@/components/home/HomeHeader';
import HeroBanner from '@/components/home/HeroBanner';
import QualityHighlights from '@/components/home/QualityHighlights';
import FeaturedProducts from '@/components/home/FeaturedProducts';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadFeatured = () => {
    setLoading(true);
    setError(false);
    getAllProductsService({ limit: 6 })
      .then((res) => {
        const list = res?.products ?? res?.data ?? res;
        setFeatured(Array.isArray(list) ? list : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader
          firstName={user?.fullName.split(' ')[0] ?? null}
          onCartPress={() => router.push('/(tabs)/shop')}
        />
        <HeroBanner onShopPress={() => router.push('/(tabs)/shop')} />
        <QualityHighlights />
        <FeaturedProducts
          products={featured}
          loading={loading}
          error={error}
          onRetry={loadFeatured}
          onSeeAllPress={() => router.push('/(tabs)/shop')}
          onProductPress={(id) => router.push(`/product/${id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
