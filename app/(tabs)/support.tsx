import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { createTicketService, addTicketReplyService } from '@/services/supportService';
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
  const ticketIdRef = useRef<string | null>(null);
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

  const addReply = (content: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content }]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      if (!ticketIdRef.current) {
        const res = await createTicketService({ subject: text.slice(0, 80), description: text });
        ticketIdRef.current = res?.ticket?._id ?? res?._id ?? null;
        addReply(
          'Your support ticket has been created. Our team will review it shortly. You can continue sending messages here.',
        );
      } else {
        await addTicketReplyService(ticketIdRef.current, text);
        addReply("Your message has been sent to the support team. We'll get back to you soon.");
      }
    } catch {
      addReply("Sorry, we couldn't send your message. Please try again.");
    } finally {
      setLoading(false);
    }
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
