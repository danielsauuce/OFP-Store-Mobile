import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface HomeHeaderProps {
  firstName: string | null;
  onCartPress: () => void;
}

export default function HomeHeader({ firstName, onCartPress }: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
      <View>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          {firstName ? `Hi, ${firstName}` : 'Olayinka'}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          Furniture Palace
        </Text>
      </View>
      <TouchableOpacity onPress={onCartPress}>
        <ShoppingBag size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}
