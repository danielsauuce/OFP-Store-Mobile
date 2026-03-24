import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface EmptyCartProps {
  onShopPress: () => void;
}

export default function EmptyCart({ onShopPress }: EmptyCartProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <ShoppingCart size={64} color={colors.textTertiary} />
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        Your cart is empty
      </Text>
      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        Add items to get started
      </Text>
      <TouchableOpacity
        className="px-8 py-3 rounded-2xl mt-2"
        style={{ backgroundColor: colors.primary }}
        onPress={onShopPress}
      >
        <Text className="text-white font-semibold">Shop Now</Text>
      </TouchableOpacity>
    </View>
  );
}
