import { View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import ProductGrid from '@/components/product/ProductGrid';
import SkeletonProductGrid from '@/components/ui/SkeletonProductGrid';

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
  error?: boolean;
  onRetry?: () => void;
  onSeeAllPress: () => void;
  onProductPress: (id: string) => void;
}

export default function FeaturedProducts({
  products,
  loading,
  error,
  onRetry,
  onSeeAllPress,
  onProductPress,
}: FeaturedProductsProps) {
  const { colors } = useTheme();

  return (
    <View className="mt-6 mb-4">
      <MotiView
        from={{ opacity: 0, translateX: -10 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 380, delay: 160 }}
        className="flex-row justify-between items-center px-5 mb-3"
      >
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Featured Products
        </Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            See All
          </Text>
        </TouchableOpacity>
      </MotiView>

      {loading ? (
        <SkeletonProductGrid count={6} />
      ) : error ? (
        <TouchableOpacity onPress={onRetry} className="items-center mt-4">
          <Text className="text-sm" style={{ color: colors.error }}>
            Failed to load products.{' '}
          </Text>
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      ) : (
        <ProductGrid products={products} onPress={onProductPress} />
      )}
    </View>
  );
}
