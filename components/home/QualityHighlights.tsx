import { View, Text } from 'react-native';
import { Hammer, Truck, Headphones } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';

const HIGHLIGHTS = [
  { label: 'Handcrafted', Icon: Hammer },
  { label: 'Fast Delivery', Icon: Truck },
  { label: '24/7 Support', Icon: Headphones },
] as const;

export default function QualityHighlights() {
  const { colors } = useTheme();

  return (
    <View className="flex-row mx-5 mt-4 gap-3">
      {HIGHLIGHTS.map(({ label, Icon }, index) => (
        <MotiView
          key={label}
          from={{ opacity: 0, scale: 0.85, translateY: 8 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 100 + index * 80 }}
          className="flex-1 items-center py-3 rounded-2xl gap-1"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <Icon size={20} color={colors.primary} />
          <Text className="text-xs font-semibold mt-1" style={{ color: colors.textSecondary }}>
            {label}
          </Text>
        </MotiView>
      ))}
    </View>
  );
}
