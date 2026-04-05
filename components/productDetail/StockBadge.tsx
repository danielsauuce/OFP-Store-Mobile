import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  inStock: boolean;
  stockQuantity: number;
}

export default function StockBadge({ inStock, stockQuantity }: Props) {
  const { colors } = useTheme();
  const color = inStock ? colors.success : colors.error;
  return (
    <View className="px-3 py-[5px] rounded-full" style={{ backgroundColor: color + '18' }}>
      <Text className="text-xs font-semibold" style={{ color }}>
        {inStock ? `In Stock · ${stockQuantity} left` : 'Out of Stock'}
      </Text>
    </View>
  );
}
