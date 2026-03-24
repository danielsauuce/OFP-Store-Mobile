import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import ChatInput from '@/components/chat/ChatInput';
import SupportHeader from '@/components/support/SupportHeader';
import ChatMessageList from '@/components/support/ChatMessageList';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function SupportScreen() {
  const { colors } = useTheme();
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
        <SupportHeader />
        <ChatMessageList messages={messages} loading={loading} />
        <ChatInput value={input} onChange={setInput} onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
