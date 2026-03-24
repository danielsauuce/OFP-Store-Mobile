import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function SupportHeader() {
  const { colors } = useTheme();

  return (
    <View
      className="px-5 py-4 border-b"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        Support
      </Text>
      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        AI-powered assistant
      </Text>
    </View>
  );
}
