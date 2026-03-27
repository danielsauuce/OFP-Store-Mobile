import React, { useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';

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
  index?: number;
}

export default function ProductCard({ product, onPress, index = 0 }: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 380, delay: Math.min(index * 70, 350) }}
      className="w-[48%]"
    >
      <Pressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
        <MotiView
          animate={{ scale: pressed ? 0.97 : 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="rounded-2xl overflow-hidden border"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <View style={{ height: 160, backgroundColor: colors.border }}>
            {product.images?.length > 0 && (
              <Image
                source={{ uri: product.images[0] }}
                style={{ width: '100%', height: 160 }}
                contentFit="cover"
              />
            )}
          </View>

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
        </MotiView>
      </Pressable>
    </MotiView>
  );
}
