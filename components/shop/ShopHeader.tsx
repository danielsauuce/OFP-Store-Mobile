import { View, Text, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ShopHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function ShopHeader({ search, onSearchChange }: ShopHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5 pt-4 pb-3">
      <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
        Shop
      </Text>
      <View
        className="flex-row items-center px-4 h-12 rounded-2xl gap-3"
        style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
      >
        <Search size={18} color={colors.textTertiary} />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search products..."
          placeholderTextColor={colors.textTertiary}
          className="flex-1 text-sm"
          style={{ color: colors.text }}
        />
      </View>
    </View>
  );
}
