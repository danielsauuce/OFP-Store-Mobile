import React, { useState } from 'react';
import { Text, Pressable, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { ShoppingCart } from 'lucide-react-native';
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
  onAddToCart?: () => void;
  index?: number;
}

export default function ProductCard({ product, onPress, onAddToCart, index = 0 }: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 380, delay: Math.min(index * 70, 350) }}
      className="w-[48%]"
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <MotiView
          animate={{ scale: pressed ? 0.97 : 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.07,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          {/* Image */}
          <View style={{ height: 160, backgroundColor: colors.surfaceVariant }}>
            {product.images?.length > 0 && (
              <Image
                source={{ uri: product.images[0] }}
                style={{ width: '100%', height: 160 }}
                contentFit="cover"
              />
            )}
          </View>

          {/* Info row */}
          <View style={{ paddingHorizontal: 12, paddingVertical: 12, gap: 4 }}>
            <Text
              numberOfLines={2}
              style={{ color: colors.text, fontSize: 13, fontWeight: '600', lineHeight: 18 }}
            >
              {product.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>
                {formatCurrency(product.price)}
              </Text>

              {product.inStock && onAddToCart && (
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation?.(); onAddToCart(); }}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: colors.surfaceVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCart size={16} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </MotiView>
      </Pressable>
    </MotiView>
  );
}
