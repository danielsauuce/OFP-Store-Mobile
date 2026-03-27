import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, Hand } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';

interface HomeHeaderProps {
  firstName: string | null;
  onCartPress: () => void;
}

export default function HomeHeader({ firstName, onCartPress }: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      className="px-5 pt-4 pb-2 flex-row justify-between items-center"
    >
      <View>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {firstName ? `Hi, ${firstName}` : 'Welcome'}
          </Text>
          {firstName && <Hand size={20} color={colors.primary} />}
        </View>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          Furniture Palace
        </Text>
      </View>
      <TouchableOpacity onPress={onCartPress}>
        <ShoppingBag size={24} color={colors.primary} />
      </TouchableOpacity>
    </MotiView>
  );
}
