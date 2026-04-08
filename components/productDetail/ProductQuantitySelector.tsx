import { View, Text, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ProductQuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
}

export default function ProductQuantitySelector({
  quantity,
  maxQuantity,
  onChange,
}: ProductQuantitySelectorProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-4 mt-2 px-5">
      <Text className="font-semibold" style={{ color: colors.text }}>
        Quantity
      </Text>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          className="w-9 h-9 rounded-full border items-center justify-center"
          style={{ borderColor: colors.border }}
          onPress={() => onChange(Math.max(1, quantity - 1))}
        >
          <Minus size={16} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-base font-bold w-6 text-center" style={{ color: colors.text }}>
          {quantity}
        </Text>
        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
          onPress={() => onChange(Math.min(maxQuantity, quantity + 1))}
        >
          <Plus size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
