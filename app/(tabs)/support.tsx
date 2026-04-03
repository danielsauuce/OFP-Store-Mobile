import React, { useRef, useState, useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Socket } from 'socket.io-client';
import {
  getConversationsService,
  getMessagesService,
  createConversationService,
  ChatMessage,
} from '@/services/chatService';
import { getChatSocket, disconnectChatSocket } from '@/services/socketService';
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
  // sender subdoc may expose userId or _id depending on backend populate
  const senderId = (msg.sender as { userId?: string; _id: string }).userId ?? msg.sender._id;
  return {
    id: msg._id,
    role: senderId === userId ? 'user' : 'assistant',
    content: msg.content,
  };
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const qc = useQueryClient();

  const convIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([WELCOME]);
  const [conversationReady, setConversationReady] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ── Socket setup ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    let active = true;

    getChatSocket().then((sock) => {
      if (!active) return;
      socketRef.current = sock;

      sock.on('connect', () => active && setSocketReady(true));
      sock.on('disconnect', () => active && setSocketReady(false));

      if (sock.connected) setSocketReady(true);

      // Incoming message from admin/support
      sock.on('chat:message', (msg: ChatMessage) => {
        if (!active || !user) return;
        const local = toLocal(msg, user.id);
        // Don't duplicate our own optimistic messages
        if (local.role === 'user') return;
        setLocalMessages((prev) => [...prev, local]);
      });
    });

    return () => {
      active = false;
      socketRef.current?.off('chat:message');
      socketRef.current?.off('connect');
      socketRef.current?.off('disconnect');
      disconnectChatSocket();
      socketRef.current = null;
    };
  }, [user]);

  // ── Load existing conversation on mount ───────────────────
  const { isLoading: loadingConversations } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      try {
        const res = await getConversationsService();
        const list = res?.conversations ?? res ?? [];
        if (Array.isArray(list) && list.length > 0 && user) {
          const latest = list[0];
          convIdRef.current = latest._id;

          const msgRes = await getMessagesService(latest._id, 1, 100);
          const msgs: ChatMessage[] = msgRes?.messages ?? msgRes ?? [];
          if (msgs.length > 0) {
            setLocalMessages([WELCOME, ...msgs.map((m) => toLocal(m, user.id))]);
          }
          setConversationReady(true);

          // Join socket room for this conversation
          socketRef.current?.emit('chat:init', { conversationId: latest._id });
        }
        return list;
      } catch {
        return [];
      }
    },
    enabled: !!user,
    staleTime: 30_000,
    retry: false,
  });

  // ── Create new conversation ───────────────────────────────
  const createMutation = useMutation({
    mutationFn: createConversationService,
    onSuccess: (res) => {
      const id = res?.conversation?._id ?? (res as { _id?: string })?._id;
      if (id) {
        convIdRef.current = id;
        setConversationReady(true);
        socketRef.current?.emit('chat:init', { conversationId: id });
        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      }
    },
  });

  // ── Send message via socket ───────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    setIsSending(true);

    // Optimistic
    const optimisticId = uid();
    setLocalMessages((prev) => [...prev, { id: optimisticId, role: 'user', content: text }]);

    try {
      let convId = convIdRef.current;

      if (!convId) {
        const res = await createMutation.mutateAsync();
        convId = res?.conversation?._id ?? (res as { _id?: string })?._id ?? null;
        convIdRef.current = convId;
      }

      if (!convId) throw new Error('No conversation');

      // Emit via socket
      socketRef.current?.emit('chat:send', { conversationId: convId, content: text });
    } catch {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        { id: uid(), role: 'assistant', content: "Sorry, your message couldn't be sent. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, createMutation]);

  // ── New conversation ──────────────────────────────────────
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
            {/* Connection status */}
            {conversationReady && (
              <View
                className="mx-4 mt-3 mb-1 px-3 py-2 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: (socketReady ? colors.success : colors.textTertiary) + '18' }}
              >
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: socketReady ? colors.success : colors.textTertiary }}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: socketReady ? colors.success : colors.textSecondary }}
                >
                  {socketReady ? 'Connected — our team can see your messages' : 'Reconnecting…'}
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
