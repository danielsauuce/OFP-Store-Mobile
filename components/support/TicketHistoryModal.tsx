import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { X, MessageSquare } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TicketHistoryModal({ visible, onClose }: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Chat History
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Info state — conversations endpoint is admin-only, history loads via socket */}
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <MessageSquare size={48} color={colors.border} />
          <Text className="font-bold text-lg text-center" style={{ color: colors.text }}>
            History loads automatically
          </Text>
          <Text className="text-sm text-center leading-5" style={{ color: colors.textSecondary }}>
            Your conversation history loads automatically when you open the Support tab.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="mt-2 px-6 py-3 rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold text-sm">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
