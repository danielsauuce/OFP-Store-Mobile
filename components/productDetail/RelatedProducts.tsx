import { View, Text } from 'react-native';
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
}

interface RelatedProductsProps {
  products: Product[];
  onPress: (id: string) => void;
}

export default function RelatedProducts({ products, onPress }: RelatedProductsProps) {
  const { colors } = useTheme();

  if (products.length === 0) return null;

  return (
    <View className="mt-6 mb-4">
      <Text className="text-lg font-bold px-5 mb-3" style={{ color: colors.text }}>
        Related Products
      </Text>
      <ProductGrid products={products} onPress={onPress} />
    </View>
  );
}
