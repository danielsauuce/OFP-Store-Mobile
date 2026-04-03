import React, { useRef, useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConversationsService,
  getMessagesService,
  createConversationService,
  sendChatMessageService,
  ChatMessage,
} from '@/services/chatService';
import ChatInput from '@/components/chat/ChatInput';
import SupportHeader from '@/components/support/SupportHeader';
import ChatMessageList from '@/components/support/ChatMessageList';
import TicketHistoryModal from '@/components/support/TicketHistoryModal';

type LocalMessage = { id: string; role: 'user' | 'assistant'; content: string };

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME: LocalMessage = {
  id: '__welcome__',
  role: 'assistant',
  content:
    'Hi! Welcome to Olayinka Furniture Palace support. How can we help you today? A member of our team will be with you shortly.',
};

function toLocal(msg: ChatMessage, userId: string): LocalMessage {
  return {
    id: msg._id,
    role: msg.sender._id === userId ? 'user' : 'assistant',
    content: msg.content,
  };
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const qc = useQueryClient();

  const convIdRef = useRef<string | null>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([WELCOME]);
  const [conversationReady, setConversationReady] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { isLoading: loadingConversations } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      try {
        const res = await getConversationsService();
        const list = res?.conversations ?? res ?? [];
        if (Array.isArray(list) && list.length > 0) {
          const latest = list[0];
          convIdRef.current = latest._id;
          if (user) {
            const msgRes = await getMessagesService(latest._id, 1, 100);
            const msgs: ChatMessage[] = msgRes?.messages ?? msgRes ?? [];
            if (msgs.length > 0) {
              setLocalMessages([WELCOME, ...msgs.map((m) => toLocal(m, user.id))]);
            }
          }
          setConversationReady(true);
        }
        return list;
      } catch {
        // No conversations yet or endpoint not reachable — start fresh
        return [];
      }
    },
    enabled: !!user,
    staleTime: 30_000,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: createConversationService,
    onSuccess: (res) => {
      const id = res?.conversation?._id ?? (res as { _id?: string })?._id;
      if (id) {
        convIdRef.current = id;
        setConversationReady(true);
        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      }
    },
  });

  const sendMutation = useMutation({
    mutationFn: ({ convId, content }: { convId: string; content: string }) =>
      sendChatMessageService(convId, content),
    onSuccess: (res) => {
      if (res?.message && user) {
        const real = toLocal(res.message, user.id);
        setLocalMessages((prev) => {
          const idx = prev.findLastIndex((m) => m.id === '__optimistic__');
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = real;
          return next;
        });
      }
    },
    onError: () => {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== '__optimistic__'),
        { id: uid(), role: 'assistant', content: "Sorry, your message couldn't be sent. Please try again." },
      ]);
    },
  });

  const isSending = createMutation.isPending || sendMutation.isPending;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');

    setLocalMessages((prev) => [...prev, { id: '__optimistic__', role: 'user', content: text }]);

    try {
      let convId = convIdRef.current;

      if (!convId) {
        const res = await createMutation.mutateAsync();
        convId = res?.conversation?._id ?? (res as { _id?: string })?._id ?? null;
        convIdRef.current = convId;
      }

      if (!convId) {
        setLocalMessages((prev) => [
          ...prev.filter((m) => m.id !== '__optimistic__'),
          {
            id: uid(),
            role: 'assistant',
            content: "Sorry, we couldn't start a conversation. Please try again.",
          },
        ]);
        return;
      }

      await sendMutation.mutateAsync({ convId, content: text });
    } catch {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== '__optimistic__'),
        { id: uid(), role: 'assistant', content: "Sorry, your message couldn't be sent. Please try again." },
      ]);
    }
  }, [input, isSending, createMutation, sendMutation]);

  const handleNewConversation = useCallback(() => {
    convIdRef.current = null;
    setConversationReady(false);
    setLocalMessages([WELCOME]);
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SupportHeader
          onViewHistory={() => setShowHistory(true)}
          onNewChat={conversationReady ? handleNewConversation : undefined}
        />

        {loadingConversations ? (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator color={colors.primary} size="large" />
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Loading your conversation…
            </Text>
          </View>
        ) : (
          <>
            {conversationReady && (
              <View
                className="mx-4 mt-3 mb-1 px-3 py-2 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: colors.success + '15' }}
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
                <Text className="text-xs font-semibold flex-1" style={{ color: colors.success }}>
                  Connected — our team can see your messages
                </Text>
              </View>
            )}
            <ChatMessageList messages={localMessages} loading={isSending} />
          </>
        )}

        <ChatInput value={input} onChange={setInput} onSend={handleSend} />
      </KeyboardAvoidingView>

      <TicketHistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
    </SafeAreaView>
  );
}
