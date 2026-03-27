import React from 'react';
import { Text } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';

export interface Message {
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
    <MotiView
      from={{ opacity: 0, translateX: isUser ? 16 : -16, scale: 0.95 }}
      animate={{ opacity: 1, translateX: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 220 }}
      className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <MotiView
        className="px-4 py-3 rounded-2xl max-w-[80%]"
        style={{
          backgroundColor: isUser ? colors.primary : colors.surface,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        }}
      >
        <Text className="text-sm leading-5" style={{ color: isUser ? colors.onPrimary : colors.text }}>
          {message.content}
        </Text>
      </MotiView>
    </MotiView>
  );
}
