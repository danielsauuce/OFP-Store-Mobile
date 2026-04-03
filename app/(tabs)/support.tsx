import React, { useRef, useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquarePlus } from 'lucide-react-native';
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

function toLocal(msg: ChatMessage, currentUserId: string): LocalMessage {
  return {
    id: msg._id,
    role: msg.sender._id === currentUserId ? 'user' : 'assistant',
    content: msg.content,
  };
}

const WELCOME: LocalMessage = {
  id: '__welcome__',
  role: 'assistant',
  content:
    "Hi! Welcome to Olayinka Furniture Palace support. How can we help you today? A member of our team will be with you shortly.",
};

export default function SupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const qc = useQueryClient();

  const conversationIdRef = useRef<string | null>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([WELCOME]);
  const [conversationReady, setConversationReady] = useState(false);
  const [showTickets, setShowTickets] = useState(false);

  // Load existing conversations on mount
  const { isLoading: loadingConversations } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      const res = await getConversationsService();
      const list = res?.conversations ?? res ?? [];
      if (list.length > 0) {
        const latest = list[0];
        conversationIdRef.current = latest._id;

        // Load messages for existing conversation
        const msgRes = await getMessagesService(latest._id, 1, 100);
        const msgs: ChatMessage[] = msgRes?.messages ?? msgRes ?? [];
        if (msgs.length > 0 && user) {
          const mapped = msgs.map((m) => toLocal(m, user.id));
          setLocalMessages([WELCOME, ...mapped]);
        }
        setConversationReady(true);
      }
      return list;
    },
    enabled: !!user,
    staleTime: 30_000,
    retry: false,
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversationService,
    onSuccess: (res) => {
      const id = res?.conversation?._id ?? (res as Record<string, unknown>)?._id as string;
      if (id) {
        conversationIdRef.current = id;
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
        // Replace the optimistic message with the real one
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
      // Remove failed optimistic message
      setLocalMessages((prev) => prev.filter((m) => m.id !== '__optimistic__'));
    },
  });

  const isSending = createConversationMutation.isPending || sendMutation.isPending;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');

    // Optimistic user message
    const optimistic: LocalMessage = { id: '__optimistic__', role: 'user', content: text };
    setLocalMessages((prev) => [...prev, optimistic]);

    try {
      let convId = conversationIdRef.current;

      if (!convId) {
        const res = await createConversationMutation.mutateAsync();
        convId = res?.conversation?._id ?? (res as Record<string, unknown>)?._id as string ?? null;
        conversationIdRef.current = convId;
      }

      if (!convId) {
        setLocalMessages((prev) => [
          ...prev.filter((m) => m.id !== '__optimistic__'),
          { id: crypto.randomUUID(), role: 'assistant', content: "Sorry, we couldn't start a conversation. Please try again." },
        ]);
        return;
      }

      await sendMutation.mutateAsync({ convId, content: text });
    } catch {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== '__optimistic__'),
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Sorry, your message couldn't be sent. Please try again.",
        },
      ]);
    }
  }, [input, isSending, createConversationMutation, sendMutation]);

  const handleNewConversation = useCallback(async () => {
    conversationIdRef.current = null;
    setConversationReady(false);
    setLocalMessages([WELCOME]);
    const res = await createConversationMutation.mutateAsync();
    const id = res?.conversation?._id ?? (res as Record<string, unknown>)?._id as string;
    if (id) conversationIdRef.current = id;
  }, [createConversationMutation]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SupportHeader
          onViewTickets={() => setShowTickets(true)}
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
            {/* Existing conversation badge */}
            {conversationReady && !loadingConversations && (
              <View
                className="mx-4 mt-3 mb-1 px-3 py-2 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: colors.success + '15' }}
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
                <Text className="text-xs font-semibold flex-1" style={{ color: colors.success }}>
                  Connected — our team can see your messages
                </Text>
                <TouchableOpacity onPress={handleNewConversation}>
                  <MessageSquarePlus size={16} color={colors.success} />
                </TouchableOpacity>
              </View>
            )}

            <ChatMessageList messages={localMessages} loading={isSending} />
          </>
        )}

        <ChatInput value={input} onChange={setInput} onSend={handleSend} />
      </KeyboardAvoidingView>

      <TicketHistoryModal visible={showTickets} onClose={() => setShowTickets(false)} />
    </SafeAreaView>
  );
}
