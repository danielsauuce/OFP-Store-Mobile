import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      <View
        className="px-4 py-3 rounded-2xl max-w-[80%]"
        style={{
          backgroundColor: isUser ? colors.primary : colors.surface,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        }}
      >
        <Text className="text-sm leading-5" style={{ color: isUser ? '#fff' : colors.text }}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
