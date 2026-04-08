import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AddToCartBarProps {
  inStock: boolean;
  adding: boolean;
  onAddToCart: () => void;
}

export default function AddToCartBar({ inStock, adding, onAddToCart }: AddToCartBarProps) {
  const { colors } = useTheme();

  return (
    <View
      className="px-5 py-4 border-t"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <TouchableOpacity
        className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: inStock ? colors.primary : colors.border }}
        onPress={onAddToCart}
        disabled={!inStock || adding}
      >
        <ShoppingCart size={20} color="#fff" />
        <Text className="text-white font-bold text-base">
          {adding ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
