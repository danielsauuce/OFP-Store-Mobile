import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CartHeaderProps {
  showClearAll: boolean;
  onClearAll: () => void;
}

export default function CartHeader({ showClearAll, onClearAll }: CartHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5 pt-4 pb-3 flex-row justify-between items-center">
      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        Cart
      </Text>
      {showClearAll && (
        <TouchableOpacity onPress={onClearAll}>
          <Text className="text-sm font-semibold" style={{ color: colors.error }}>
            Clear All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
