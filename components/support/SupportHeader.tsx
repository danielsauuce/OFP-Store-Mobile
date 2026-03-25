import { View, Text, TouchableOpacity } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SupportHeaderProps {
  onViewTickets?: () => void;
}

export default function SupportHeader({ onViewTickets }: SupportHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Support
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          AI-powered assistant
        </Text>
      </View>
      {onViewTickets && (
        <TouchableOpacity
          onPress={onViewTickets}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ backgroundColor: colors.primary + '15' }}
        >
          <ClipboardList size={16} color={colors.primary} />
          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
            My Tickets
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
