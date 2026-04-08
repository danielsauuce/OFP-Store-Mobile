import { useTheme } from '@/contexts/ThemeContext';
import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  quantity: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

export default function QuantityControl({ quantity, max, onDecrement, onIncrement }: Props) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-3">
      <TouchableOpacity
        onPress={onDecrement}
        className="w-8 h-8 rounded-[10px] border items-center justify-center"
        style={{ borderColor: colors.border }}
      >
        <Minus size={14} color={colors.text} />
      </TouchableOpacity>
      <Text className="text-[15px] font-bold text-center min-w-[20px]" style={{ color: colors.text }}>
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        disabled={quantity >= max}
        className="w-8 h-8 rounded-[10px] items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Plus size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
