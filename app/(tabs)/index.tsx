import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ProductGrid from '@/components/product/ProductGrid';
import { getAllProductsService } from '@/services/productService';

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

  useEffect(() => {
    getAllProductsService({ limit: 6 })
      .then((res) => setFeatured(res.products ?? res ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {user ? `Hi, ${user.fullName.split(' ')[0]} 👋` : 'Olayinka'}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Furniture Palace
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
            <ShoppingBag size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View className="mx-5 mt-4 rounded-3xl overflow-hidden h-48">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60',
            }}
            className="w-full h-full"
          />
          <View className="absolute inset-0 justify-end p-5" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <Text className="text-white text-xl font-bold">New Collection</Text>
            <Text className="text-white/80 text-sm mb-3">Timeless furniture for every space</Text>
            <TouchableOpacity
              className="self-start px-5 py-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push('/(tabs)/shop')}
            >
              <Text className="text-white font-semibold text-sm">Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quality highlights */}
        <View className="flex-row mx-5 mt-4 gap-3">
          {[
            { label: 'Handcrafted', icon: '✦' },
            { label: 'Fast Delivery', icon: '⚡' },
            { label: '24/7 Support', icon: '💬' },
          ].map((item) => (
            <View
              key={item.label}
              className="flex-1 items-center py-3 rounded-2xl"
              style={{ backgroundColor: colors.surfaceVariant }}
            >
              <Text className="text-lg">{item.icon}</Text>
              <Text className="text-xs font-semibold mt-1" style={{ color: colors.textSecondary }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Featured Products */}
        <View className="mt-6 mb-4">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Featured Products
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} className="mt-4" />
          ) : (
            <ProductGrid products={featured} onPress={(id) => router.push(`/product/${id}`)} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
