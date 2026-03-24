import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ProductGrid from '@/components/product/ProductGrid';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
}

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  onSeeAllPress: () => void;
  onProductPress: (id: string) => void;
}

export default function FeaturedProducts({
  products,
  loading,
  onSeeAllPress,
  onProductPress,
}: FeaturedProductsProps) {
  const { colors } = useTheme();

  return (
    <View className="mt-6 mb-4">
      <View className="flex-row justify-between items-center px-5 mb-3">
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Featured Products
        </Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} className="mt-4" />
      ) : (
        <ProductGrid products={products} onPress={onProductPress} />
      )}
    </View>
  );
}
