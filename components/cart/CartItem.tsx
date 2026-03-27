import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  primaryImage?: { secureUrl?: string; url?: string };
}

interface CartItemData {
  _id: string;
  product: CartProduct;
  quantity: number;
}

interface Props {
  item: CartItemData;
  index?: number;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({ item, index = 0, onUpdate, onRemove }: Props) {
  const { colors } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateX: 30 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 180, delay: index * 60 }}
      className="flex-row p-3 mx-5 mb-3 rounded-2xl border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <Image
        source={{
          uri:
            item.product.images?.[0] ??
            item.product.primaryImage?.secureUrl ??
            item.product.primaryImage?.url,
        }}
        style={{ width: 96, height: 96, borderRadius: 12 }}
        contentFit="cover"
      />

      <View className="flex-1 ml-3 justify-between">
        <View className="flex-row justify-between">
          <Text className="font-semibold flex-1 mr-2" numberOfLines={2} style={{ color: colors.text }}>
            {item.product.name}
          </Text>

          <TouchableOpacity onPress={onRemove} accessibilityRole="button" accessibilityLabel="Remove item">
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={{ color: colors.primary }} className="font-bold">
          {formatCurrency(item.product.price)}
        </Text>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => onUpdate(Math.max(1, item.quantity - 1))}
            className="w-8 h-8 rounded border items-center justify-center"
            style={{ borderColor: colors.border }}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
          >
            <Minus size={14} color={colors.text} />
          </TouchableOpacity>

          <Text className="font-semibold" style={{ color: colors.text }}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => onUpdate(item.quantity + 1)}
            className="w-8 h-8 rounded items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
          >
            <Plus size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </MotiView>
  );
}
