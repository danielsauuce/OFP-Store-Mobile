import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Send, Smile, Paperclip } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled = false }: Props) {
  const { colors } = useTheme();
  const isEmpty = !value || value.trim().length === 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        borderTopWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      {/* Input area with inline icons */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: colors.surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 12,
          paddingVertical: 6,
          minHeight: 44,
          gap: 6,
        }}
      >
        <TouchableOpacity style={{ paddingBottom: 6 }}>
          <Smile size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Type something..."
          placeholderTextColor={colors.textSecondary}
          style={{
            flex: 1,
            fontSize: 14,
            color: colors.text,
            paddingVertical: 4,
            maxHeight: 100,
          }}
          multiline
          editable={!disabled}
        />

        <TouchableOpacity style={{ paddingBottom: 6 }}>
          <Paperclip size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Send button */}
      <TouchableOpacity
        testID="send-button"
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={isEmpty || disabled ? undefined : onSend}
        disabled={isEmpty || disabled}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          opacity: isEmpty || disabled ? 0.4 : 1,
        }}
      >
        <Send size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
