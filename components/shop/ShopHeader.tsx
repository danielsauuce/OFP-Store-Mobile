import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ShopHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilterCount?: number;
  onFilterPress?: () => void;
}

export default function ShopHeader({
  search,
  onSearchChange,
  activeFilterCount = 0,
  onFilterPress,
}: ShopHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5 pt-4 pb-3">
      <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
        Shop
      </Text>
      <View className="flex-row gap-3 items-center">
        <View
          className="flex-1 flex-row items-center px-4 h-12 rounded-2xl gap-3"
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

        <TouchableOpacity
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surface,
            borderWidth: 1,
            borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
          }}
          onPress={onFilterPress}
        >
          <SlidersHorizontal size={18} color={activeFilterCount > 0 ? '#fff' : colors.textSecondary} />
          {activeFilterCount > 0 && (
            <View
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-white text-xs font-bold" style={{ fontSize: 10 }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
