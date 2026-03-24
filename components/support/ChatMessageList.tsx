import { useRef } from 'react';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useChatScroll } from '@/hooks/useChatScroll';
import ChatBubble from '@/components/chat/ChatBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageListProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  const { colors } = useTheme();
  const listRef = useRef<FlatList>(null);

  useChatScroll(listRef, [messages]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(m) => m.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ListFooterComponent={
        loading ? (
          <View className="flex-row items-center gap-2 px-4 py-2">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Thinking...
            </Text>
          </View>
        ) : null
      }
    />
  );
}
