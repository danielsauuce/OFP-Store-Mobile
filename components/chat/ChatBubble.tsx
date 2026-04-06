import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { Bot } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  senderName?: string;
  senderAvatar?: string;
}

interface Props {
  message: Message;
}

function formatTime(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function AssistantAvatar() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Bot size={16} color={colors.primary} />
    </View>
  );
}

export default function ChatBubble({ message }: Props) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  const time = formatTime(message.timestamp);

  return (
    <MotiView
      from={{ opacity: 0, translateX: isUser ? 16 : -16, scale: 0.95 }}
      animate={{ opacity: 1, translateX: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 220 }}
    >
      {/* Sender label + time */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: 4,
          paddingHorizontal: isUser ? 0 : 40,
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
          {isUser ? 'You' : (message.senderName ?? 'Support')}
        </Text>
        {time ? <Text style={{ fontSize: 10, color: colors.textTertiary }}>{time}</Text> : null}
      </View>

      {/* Bubble row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          gap: 8,
        }}
      >
        {/* Assistant avatar */}
        {!isUser &&
          (message.senderAvatar ? (
            <Image
              source={{ uri: message.senderAvatar }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              contentFit="cover"
            />
          ) : (
            <AssistantAvatar />
          ))}

        {/* Bubble */}
        <View
          style={{
            maxWidth: '75%',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 20,
            borderBottomRightRadius: isUser ? 4 : 20,
            borderBottomLeftRadius: isUser ? 20 : 4,
            backgroundColor: isUser ? colors.primary : colors.surface,
            borderWidth: isUser ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: isUser ? '#fff' : colors.text,
            }}
          >
            {message.content}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}
