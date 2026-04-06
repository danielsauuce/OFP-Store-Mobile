import ChatInput from '@/components/chat/ChatInput';
import ChatMessageList from '@/components/support/ChatMessageList';
import SupportHeader from '@/components/support/SupportHeader';
import TicketHistoryModal from '@/components/support/TicketHistoryModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { ChatMessage } from '@/services/chatService';
import { createChatSocket } from '@/services/socketService';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Socket } from 'socket.io-client';

type LocalMessage = { id: string; role: 'user' | 'assistant'; content: string };

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME: LocalMessage = {
  id: '__welcome__',
  role: 'assistant',
  content:
    'Hi! Welcome to Olayinka Furniture Palace support. How can we help you today? A member of our team will be with you shortly.',
};

// Server populates sender.userId as a full object — extract the string _id safely.
function resolveSenderId(sender: ChatMessage['sender']): string | undefined {
  const uid = sender.userId;
  if (typeof uid === 'object' && uid !== null) {
    return (uid as { _id?: string })._id;
  }
  return uid as string | undefined;
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const convIdRef = useRef<string | null>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([WELCOME]);
  const [connected, setConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [convReady, setConvReady] = useState(false);
  // 'idle' before any socket attempt, 'connecting' while socket is establishing, 'ready' once connected
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready'>('idle');

  // Socket lifecycle
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setStatus('connecting');

    createChatSocket()
      .then((socket) => {
        if (cancelled) {
          socket.disconnect();
          return;
        }
        socketRef.current = socket;

        socket.on('connect', () => {
          setConnected(true);
          setStatus('ready');
          socket.emit('chat:init');
        });

        socket.on('disconnect', () => {
          setConnected(false);
        });

        socket.on('connect_error', (err) => {
          console.error('Chat connect_error:', err.message);
          setConnected(false);
          setStatus('idle');
        });

        socket.on('chat:initialized', (data: { conversationId: string; messages: ChatMessage[] }) => {
          convIdRef.current = data.conversationId;
          setConvReady(true);
          if (data.messages?.length > 0) {
            const mapped: LocalMessage[] = data.messages.map((m) => {
              const senderId = resolveSenderId(m.sender);
              return {
                id: m._id,
                role: (senderId ?? m.sender._id) === user.id ? 'user' : 'assistant',
                content: m.message,
              };
            });
            setMessages([WELCOME, ...mapped]);
          }
          setStatus('ready');
        });

        socket.on('chat:message', (msg: ChatMessage & { tempId?: string }) => {
          const senderId = resolveSenderId(msg.sender);
          const isOwn = senderId === user.id || msg.sender?.role === 'customer';

          setMessages((prev) => {
            // Replace optimistic bubble by tempId
            if (msg.tempId) {
              const idx = prev.findIndex((m) => m.id === msg.tempId);
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = { id: msg._id, role: isOwn ? 'user' : 'assistant', content: msg.message };
                return next;
              }
            }
            // Deduplicate by _id
            if (prev.some((m) => m.id === msg._id)) return prev;
            return [...prev, { id: msg._id, role: isOwn ? 'user' : 'assistant', content: msg.message }];
          });
        });

        socket.on('chat:admin-joined', () => {
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: 'assistant', content: 'A support agent has joined the conversation.' },
          ]);
        });

        socket.on('chat:closed', () => {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content: 'This conversation has been closed. Start a new chat if you need further help.',
            },
          ]);
          convIdRef.current = null;
          setConvReady(false);
        });

        socket.on('chat:error', (err: { message?: string }) => {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content: err?.message ?? 'Something went wrong. Please try again.',
            },
          ]);
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to create chat socket:', err.message);
        setStatus('idle');
        setConnected(false);
      });

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      convIdRef.current = null;
      setConnected(false);
      setConvReady(false);
      setStatus('idle');
      setMessages([WELCOME]);
    };
  }, [user]);

  // send
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isSending || !socketRef.current || !connected) return;
    if (!convIdRef.current) {
      // Conversation not initialized yet — re-emit init and queue will pick up
      socketRef.current.emit('chat:init');
      return;
    }

    setInput('');
    setIsSending(true);

    const tempId = uid();
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: text }]);

    socketRef.current.emit('chat:send', { conversationId: convIdRef.current, message: text, tempId }, () =>
      setIsSending(false),
    );

    // Fallback timeout in case ack never fires
    setTimeout(() => setIsSending(false), 5000);
  }, [input, isSending]);

  // New conversation
  const handleNewConversation = useCallback(() => {
    convIdRef.current = null;
    setConvReady(false);
    setMessages([WELCOME]);
    socketRef.current?.emit('chat:init');
  }, []);

  const isReady = status === 'ready' || (status === 'connecting' && connected);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SupportHeader
          onViewHistory={() => setShowHistory(true)}
          onNewChat={isReady ? handleNewConversation : undefined}
        />

        {/* Connection status banner — shown while connecting or after connect */}
        {status !== 'idle' && (
          <View
            className="mx-4 mt-3 mb-1 px-3 py-2 rounded-xl flex-row items-center gap-2"
            style={{
              backgroundColor: (connected ? colors.success : colors.textTertiary) + '18',
            }}
          >
            {status === 'connecting' && !connected ? (
              <ActivityIndicator size={12} color={colors.textTertiary} />
            ) : (
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: connected ? colors.success : colors.textTertiary }}
              />
            )}
            <Text
              className="text-xs font-semibold"
              style={{ color: connected ? colors.success : colors.textSecondary }}
            >
              {connected
                ? 'Connected — our team can see your messages'
                : status === 'connecting'
                  ? 'Connecting to support…'
                  : 'Reconnecting…'}
            </Text>
          </View>
        )}
        <ChatMessageList messages={messages} loading={isSending} />

        <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={!connected} />
      </KeyboardAvoidingView>

      <TicketHistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
    </SafeAreaView>
  );
}
