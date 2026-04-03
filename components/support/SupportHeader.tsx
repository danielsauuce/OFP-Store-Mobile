import { View, Text, TouchableOpacity } from 'react-native';
import { ClipboardList, Headphones } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SupportHeaderProps {
  onViewTickets?: () => void;
  onNewChat?: () => void;
}

export default function SupportHeader({ onViewTickets, onNewChat }: SupportHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center gap-2.5">
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary + '18' }}
        >
          <Headphones size={18} color={colors.primary} />
        </View>
        <View>
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Live Support
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            We typically reply within minutes
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {onNewChat && (
          <TouchableOpacity
            onPress={onNewChat}
            className="px-3 py-2 rounded-xl"
            style={{ backgroundColor: colors.surfaceVariant }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
              New chat
            </Text>
          </TouchableOpacity>
        )}

        {onViewTickets && (
          <TouchableOpacity
            onPress={onViewTickets}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <ClipboardList size={16} color={colors.primary} />
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              Tickets
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
