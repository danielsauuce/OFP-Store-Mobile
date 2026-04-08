import { useRef } from 'react';
import { FlatList, View, Text } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { useChatScroll } from '@/hooks/useChatScroll';
import ChatBubble, { Message } from '@/components/chat/ChatBubble';

interface ChatMessageListProps {
  messages: Message[];
  loading: boolean;
}

function TypingIndicator() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
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
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <MotiView
              key={i}
              from={{ translateY: 0, opacity: 0.4 }}
              animate={{ translateY: -3, opacity: 1 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 350,
                delay: i * 120,
                repeatReverse: true,
              }}
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.primary,
              }}
            />
          ))}
        </View>
      </View>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          borderBottomLeftRadius: 4,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <MotiView
              key={i}
              from={{ translateY: 0 }}
              animate={{ translateY: -4 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 380,
                delay: i * 130,
                repeatReverse: true,
              }}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.textTertiary,
              }}
            />
          ))}
        </View>
      </View>
      <Text style={{ fontSize: 11, color: colors.textTertiary, marginLeft: 4 }}>Typing...</Text>
    </View>
  );
}

export default function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  const listRef = useRef<FlatList>(null);

  useChatScroll(listRef, [messages]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(m) => m.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 14 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ListFooterComponent={loading ? <TypingIndicator /> : null}
    />
  );
}
