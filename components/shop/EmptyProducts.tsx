import { View, Text } from 'react-native';
import { Armchair } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function EmptyProducts() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-2">
      <Armchair size={56} color={colors.textTertiary} />
      <Text className="font-semibold text-lg" style={{ color: colors.text }}>
        No products found
      </Text>
      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        Try adjusting your search or filter
      </Text>
    </View>
  );
}
