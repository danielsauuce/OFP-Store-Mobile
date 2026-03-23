import React, { useRef, useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useChatScroll } from '@/hooks/useChatScroll';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const listRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hi! I'm your Olayinka Furniture Palace assistant. How can I help you today? I can help you find products, check your orders, or manage your cart.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useChatScroll(listRef, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Placeholder AI response — replace with real AI service call
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thanks for your message: "${text}". Our AI support is being set up. Please check back soon or contact us directly.`,
      };
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View
          className="px-5 py-4 border-b"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Support
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            AI-powered assistant
          </Text>
        </View>

        {/* Messages */}
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

        {/* Input */}
        <ChatInput value={input} onChange={setInput} onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
