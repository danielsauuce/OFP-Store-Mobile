import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CartItem({ item, onUpdate, onRemove }) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row p-3 mx-5 mb-3 rounded-2xl border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <Image source={{ uri: item.product.images[0] }} className="w-24 h-24 rounded-xl" />

      <View className="flex-1 ml-3 justify-between">
        <View className="flex-row justify-between">
          <Text className="font-semibold flex-1 mr-2" numberOfLines={2}>
            {item.product.name}
          </Text>

          <TouchableOpacity onPress={onRemove}>
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={{ color: colors.primary }} className="font-bold">
          {formatCurrency(item.product.price)}
        </Text>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => onUpdate(item.quantity - 1)}
            className="w-8 h-8 rounded border items-center justify-center"
            style={{ borderColor: colors.border }}
          >
            <Minus size={14} color={colors.text} />
          </TouchableOpacity>

          <Text className="font-semibold">{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => onUpdate(item.quantity + 1)}
            className="w-8 h-8 rounded items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
