import { View, Text, TouchableOpacity } from 'react-native';
import { Bot, MoreVertical } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SupportHeaderProps {
  onViewHistory?: () => void;
  onNewChat?: () => void;
  connected?: boolean;
}

export default function SupportHeader({ onViewHistory, onNewChat, connected = false }: SupportHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      {/* Left — avatar + title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ position: 'relative' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '18',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={20} color={colors.primary} />
          </View>
          {/* Online dot */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: connected ? '#10B981' : colors.textTertiary,
              borderWidth: 2,
              borderColor: colors.surface,
            }}
          />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Support Chat</Text>
          <Text style={{ fontSize: 12, color: connected ? '#10B981' : colors.textSecondary }}>
            {connected ? 'Online' : 'Connecting...'}
          </Text>
        </View>
      </View>

      {/* Right — actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onNewChat && (
          <TouchableOpacity
            onPress={onNewChat}
            accessibilityRole="button"
            accessibilityLabel="New chat"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: colors.primary + '15',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>New</Text>
          </TouchableOpacity>
        )}
        {onViewHistory && (
          <TouchableOpacity
            onPress={onViewHistory}
            accessibilityRole="button"
            accessibilityLabel="History"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
