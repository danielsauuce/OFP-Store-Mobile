import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: Props) {
  const { colors } = useTheme();
  const isEmpty = !value || value.trim().length === 0;

  return (
    <View
      className="flex-row items-end px-4 py-3 border-t gap-2"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Type message..."
        placeholderTextColor={colors.textTertiary}
        className="flex-1 rounded-full px-4 py-2 border"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.text,
        }}
        multiline
      />

      <TouchableOpacity
        onPress={isEmpty ? undefined : onSend}
        disabled={isEmpty}
        className="w-11 h-11 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.primary, opacity: isEmpty ? 0.4 : 1 }}
      >
        <Send size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
