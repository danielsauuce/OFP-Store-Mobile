import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';

interface ProductInfoProps {
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
  material?: string;
  dimensions?: string;
}

export default function ProductInfo({
  name,
  category,
  price,
  inStock,
  stockQuantity,
  description,
  material,
  dimensions,
}: ProductInfoProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5 pt-5 gap-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-xs font-bold uppercase opacity-50 mb-1" style={{ color: colors.text }}>
            {category}
          </Text>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {name}
          </Text>
        </View>
        <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
          {formatCurrency(price)}
        </Text>
      </View>

      <View
        className="self-start px-3 py-1 rounded-full"
        style={{ backgroundColor: inStock ? colors.success + '20' : colors.error + '20' }}
      >
        <Text className="text-xs font-semibold" style={{ color: inStock ? colors.success : colors.error }}>
          {inStock ? `In Stock (${stockQuantity} left)` : 'Out of Stock'}
        </Text>
      </View>

      {description && (
        <Text className="text-sm leading-6" style={{ color: colors.textSecondary }}>
          {description}
        </Text>
      )}

      {(material || dimensions) && (
        <View className="p-4 rounded-2xl gap-2" style={{ backgroundColor: colors.surfaceVariant }}>
          {material && (
            <View className="flex-row justify-between">
              <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                Material
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>
                {material}
              </Text>
            </View>
          )}
          {dimensions && (
            <View className="flex-row justify-between">
              <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                Dimensions
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>
                {dimensions}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
