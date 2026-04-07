import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { Bot } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeImageUrl } from '@/utils/imageUtils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  senderName?: string;
  /** Avatar URL for the support agent (populated from server) */
  senderAvatar?: string;
  isOptimistic?: boolean;
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

function SupportAvatar({ avatarUrl }: { avatarUrl?: string }) {
  const { colors } = useTheme();
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: 28, height: 28, borderRadius: 14 }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Bot size={14} color={colors.primary} />
    </View>
  );
}

function UserAvatar() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ME';

  const normalizedProfilePicture = normalizeImageUrl(user?.profilePicture);

  if (normalizedProfilePicture) {
    return (
      <Image
        source={{ uri: normalizedProfilePicture }}
        style={{ width: 28, height: 28, borderRadius: 14 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary + '30',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 9, fontWeight: '700', color: colors.primary }}>{initials}</Text>
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
          paddingHorizontal: isUser ? 0 : 36,
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
          {isUser ? 'You' : (message.senderName ?? 'Support')}
        </Text>
        {time ? (
          <Text style={{ fontSize: 10, color: colors.textTertiary }}>
            {time}
            {message.isOptimistic ? ' · Sending…' : ''}
          </Text>
        ) : null}
      </View>

      {/* Bubble row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          gap: 6,
        }}
      >
        {/* Support avatar — left side */}
        {!isUser && <SupportAvatar avatarUrl={message.senderAvatar} />}

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
            opacity: message.isOptimistic ? 0.6 : 1,
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

        {/* User avatar — right side */}
        {isUser && <UserAvatar />}
      </View>
    </MotiView>
  );
}
