import { useRef } from 'react';
import { FlatList, View } from 'react-native';
import { MotiView } from 'moti';
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

function TypingIndicator() {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ translateY: 0 }}
          animate={{ translateY: -5 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 380,
            delay: i * 130,
            repeatReverse: true,
          }}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.primary,
            opacity: 0.7,
          }}
        />
      ))}
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
      contentContainerStyle={{ padding: 16, gap: 12 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ListFooterComponent={loading ? <TypingIndicator /> : null}
    />
  );
}
