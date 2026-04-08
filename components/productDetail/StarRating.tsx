import { useTheme } from '@/contexts/ThemeContext';
import { Star } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  rating: number;
  count: number;
}

export default function StarRating({ rating, count }: Props) {
  const { colors } = useTheme();
  const rounded = Math.round(rating);
  return (
    <View className="flex-row items-center gap-1.5">
      <Text className="text-[15px] font-bold" style={{ color: colors.text }}>
        {rating.toFixed(1)}
      </Text>
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            color={s <= rounded ? '#F59E0B' : colors.border}
            fill={s <= rounded ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>
      <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
        ({count})
      </Text>
    </View>
  );
}
