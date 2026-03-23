import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
}

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] rounded-2xl overflow-hidden border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <Image source={{ uri: product.images[0] }} className="w-full h-40" contentFit="cover" />

      <View className="p-3">
        <Text className="text-xs font-bold opacity-50 mb-1" style={{ color: colors.text }}>
          {product.category.toUpperCase()}
        </Text>

        <Text className="text-sm font-semibold mb-2" numberOfLines={2} style={{ color: colors.text }}>
          {product.name}
        </Text>

        <View className="flex-row justify-between items-center">
          <Text style={{ color: colors.primary }} className="font-bold">
            {formatCurrency(product.price)}
          </Text>

          <View
            className="px-2 py-1 rounded"
            style={{
              backgroundColor: product.inStock ? colors.success + '20' : colors.error + '20',
            }}
          >
            <Text
              className="text-[10px] font-semibold"
              style={{ color: product.inStock ? colors.success : colors.error }}
            >
              {product.inStock ? 'In Stock' : 'Out'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
