import React, { useRef, useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMyTicketsService,
  getTicketByIdService,
  createTicketService,
  addTicketReplyService,
} from '@/services/supportService';
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

export default function SupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const qc = useQueryClient();

  const ticketIdRef = useRef<string | null>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([WELCOME]);
  const [conversationReady, setConversationReady] = useState(false);
  const [showTickets, setShowTickets] = useState(false);

  // Load most recent open ticket on mount
  const { isLoading: loadingConversations } = useQuery({
    queryKey: ['support', 'active'],
    queryFn: async () => {
      const res = await getMyTicketsService();
      const list = res?.tickets ?? res?.data ?? res ?? [];
      const open = Array.isArray(list)
        ? (list.find((t: { status: string }) => t.status === 'open' || t.status === 'in_progress') ?? list[0])
        : null;

      if (open) {
        ticketIdRef.current = open._id;

        // Load full ticket with replies
        const detail = await getTicketByIdService(open._id);
        const ticket = detail?.ticket ?? detail;
        if (ticket) {
          const msgs: LocalMessage[] = [
            WELCOME,
            { id: ticket._id + '_msg', role: 'user', content: ticket.message },
          ];
          (ticket.replies ?? []).forEach((r: { _id: string; text: string; sender: string }) => {
            msgs.push({
              id: r._id,
              role: r.sender === 'admin' ? 'assistant' : 'user',
              content: r.text,
            });
          });
          setLocalMessages(msgs);
          setConversationReady(true);
        }
      }
      return list;
    },
    enabled: !!user,
    staleTime: 30_000,
    retry: false,
  });

  // Create new ticket (first message in a new conversation)
  const createMutation = useMutation({
    mutationFn: (message: string) => createTicketService({ subject: 'Support Chat', message }),
    onSuccess: (res) => {
      const id = res?.ticket?._id ?? res?._id;
      if (id) {
        ticketIdRef.current = id;
        setConversationReady(true);
        qc.invalidateQueries({ queryKey: ['support', 'active'] });
        qc.invalidateQueries({ queryKey: ['tickets'] });
      }
    },
  });

  // Reply to existing ticket
  const replyMutation = useMutation({
    mutationFn: ({ ticketId, text }: { ticketId: string; text: string }) =>
      addTicketReplyService(ticketId, text),
    onSuccess: (res) => {
      const reply = res?.reply ?? res;
      if (reply) {
        setLocalMessages((prev) => {
          const idx = prev.findLastIndex((m) => m.id === '__optimistic__');
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { id: reply._id ?? uid(), role: 'user', content: reply.text };
          return next;
        });
      }
    },
    onError: () => {
      setLocalMessages((prev) => prev.filter((m) => m.id !== '__optimistic__'));
      setLocalMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: "Sorry, your message couldn't be sent. Please try again." },
      ]);
    },
  });

  const isSending = createMutation.isPending || replyMutation.isPending;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');

    // Optimistic message
    setLocalMessages((prev) => [...prev, { id: '__optimistic__', role: 'user', content: text }]);

    try {
      if (!ticketIdRef.current) {
        // First message — create a ticket
        const res = await createMutation.mutateAsync(text);
        const id = res?.ticket?._id ?? res?._id;
        if (!id) {
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
        // Replace optimistic with real message (the ticket's own message)
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === '__optimistic__' ? { ...m, id: id + '_msg' } : m)),
        );
      } else {
        await replyMutation.mutateAsync({ ticketId: ticketIdRef.current, text });
      }
    } catch {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== '__optimistic__'),
        { id: uid(), role: 'assistant', content: "Sorry, your message couldn't be sent. Please try again." },
      ]);
    }
  }, [input, isSending, createMutation, replyMutation]);

  const handleNewConversation = useCallback(() => {
    ticketIdRef.current = null;
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

      <TicketHistoryModal visible={showTickets} onClose={() => setShowTickets(false)} />
    </SafeAreaView>
  );
}
