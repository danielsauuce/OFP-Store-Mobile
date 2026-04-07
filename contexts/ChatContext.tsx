/**
 * ChatContext — owns the socket for the lifetime of the authenticated session,
 * not just while the Support tab is visible. This means messages arrive and are
 * stored even when the user is on another tab, matching the web ChatWidget behaviour.
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { createChatSocket } from '@/services/socketService';
import type { ChatMessage } from '@/services/chatService';

export type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  senderName?: string;
  senderAvatar?: string;
  isOptimistic?: boolean;
};

type ConvStatus = 'pending' | 'active' | 'closed';
type SocketStatus = 'idle' | 'connecting' | 'ready';

interface ChatContextType {
  messages: LocalMessage[];
  connected: boolean;
  socketStatus: SocketStatus;
  convStatus: ConvStatus;
  convReady: boolean;
  isSending: boolean;
  unreadCount: number;
  clearUnread: () => void;
  sendMessage: (text: string) => void;
  startNewConversation: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME: LocalMessage = {
  id: '__welcome__',
  role: 'assistant',
  content:
    'Hi! Welcome to Olayinka Furniture Palace support. How can we help you today? A member of our team will be with you shortly.',
};

// Server populates sender.userId as a full object — extract the string _id safely.
function resolveSenderId(sender: ChatMessage['sender']): string | undefined {
  const u = sender.userId;
  if (typeof u === 'object' && u !== null) return (u as { _id?: string })._id;
  return u as string | undefined;
}

function resolveAvatar(sender: ChatMessage['sender']): string | undefined {
  // When populated, userId is a full user object that may carry profilePicture
  const u = sender.userId as
    | { profilePicture?: string | { secureUrl?: string; secure_url?: string; url?: string } }
    | null
    | undefined;
  if (!u || typeof u !== 'object') return undefined;
  const pic = u.profilePicture;
  if (!pic) return undefined;
  if (typeof pic === 'string') return pic || undefined;
  return pic.secureUrl ?? pic.secure_url ?? pic.url ?? undefined;
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const convIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<LocalMessage[]>([WELCOME]);
  const [connected, setConnected] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('idle');
  const [convStatus, setConvStatus] = useState<ConvStatus>('pending');
  const [convReady, setConvReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track whether support tab is open so we only increment unread when it's not
  const supportOpenRef = useRef(false);

  const clearUnread = useCallback(() => {
    supportOpenRef.current = true;
    setUnreadCount(0);
  }, []);

  // Called when support tab loses focus
  const markSupportClosed = useCallback(() => {
    supportOpenRef.current = false;
  }, []);

  // Expose markSupportClosed so support.tsx can call it on blur
  (ChatContext as unknown as { _markClosed?: () => void })._markClosed = markSupportClosed;

  useEffect(() => {
    if (!user) {
      // Disconnect and reset on logout
      socketRef.current?.disconnect();
      socketRef.current = null;
      convIdRef.current = null;
      setConnected(false);
      setConvReady(false);
      setSocketStatus('idle');
      setConvStatus('pending');
      setMessages([WELCOME]);
      setUnreadCount(0);
      return;
    }

    // Already connected — nothing to do
    if (socketRef.current?.connected) return;

    setSocketStatus('connecting');

    createChatSocket()
      .then((socket) => {
        if (!user) {
          socket.disconnect();
          return;
        }
        socketRef.current = socket;

        socket.on('connect', () => {
          setConnected(true);
          setSocketStatus('ready');
          socket.emit('chat:init');
        });

        socket.on('disconnect', () => {
          setConnected(false);
          setSocketStatus('idle');
        });

        socket.on('reconnect', () => {
          console.log('✅ Socket reconnected');
          setConnected(true);
          setSocketStatus('connecting');
          // Re-initialize chat after reconnection
          if (convIdRef.current) {
            socket.emit('chat:init');
          }
        });

        socket.on('connect_error', (err) => {
          console.error('Chat connect_error:', err.message);
          setConnected(false);
          setSocketStatus('idle');
        });

        socket.on(
          'chat:initialized',
          (data: { conversationId: string; status?: string; messages: ChatMessage[] }) => {
            convIdRef.current = data.conversationId;
            setConvReady(true);
            if (data.status) setConvStatus(data.status as ConvStatus);
            if (data.messages?.length > 0) {
              const mapped: LocalMessage[] = data.messages.map((m) => {
                const senderId = resolveSenderId(m.sender);
                const isMe = (senderId ?? m.sender._id) === user.id;
                return {
                  id: m._id,
                  role: isMe ? 'user' : 'assistant',
                  content: m.message,
                  timestamp: m.createdAt,
                  senderName: isMe ? undefined : (m.sender.fullName ?? 'Support'),
                  senderAvatar: isMe ? undefined : resolveAvatar(m.sender),
                };
              });
              setMessages([WELCOME, ...mapped]);
            }
            setSocketStatus('ready');
          },
        );

        socket.on('chat:message', (msg: ChatMessage & { tempId?: string }) => {
          const senderId = resolveSenderId(msg.sender);
          const isOwn = senderId === user.id || msg.sender?.role === 'customer';

          const incoming: LocalMessage = {
            id: msg._id,
            role: isOwn ? 'user' : 'assistant',
            content: msg.message,
            timestamp: msg.createdAt,
            senderName: isOwn ? undefined : (msg.sender.fullName ?? 'Support'),
            senderAvatar: isOwn ? undefined : resolveAvatar(msg.sender),
          };

          setMessages((prev) => {
            // Replace optimistic bubble by tempId
            if (msg.tempId) {
              const idx = prev.findIndex((m) => m.id === msg.tempId);
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = incoming;
                return next;
              }
            }
            // Deduplicate by _id
            if (prev.some((m) => m.id === msg._id)) return prev;

            // Increment unread only for incoming messages when support tab is closed
            if (!isOwn && !supportOpenRef.current) {
              setUnreadCount((n) => n + 1);
            }
            return [...prev, incoming];
          });
        });

        socket.on('chat:typing', ({ isTyping }: { isTyping: boolean }) => {
          // Forward to isSending as a visual cue (typing indicator handled in list)
          void isTyping;
        });

        socket.on('chat:admin-joined', () => {
          setConvStatus('active');
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: 'assistant', content: 'A support agent has joined the conversation.' },
          ]);
        });

        socket.on('chat:closed', () => {
          setConvStatus('closed');
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
        console.error('Failed to create chat socket:', err.message);
        setSocketStatus('idle');
      });

    return () => {
      // Only fully disconnect on unmount (user logged out handled above)
    };
  }, [user]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending || !socketRef.current || !convIdRef.current) return;

      setIsSending(true);
      const tempId = uid();

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          role: 'user',
          content: trimmed,
          timestamp: new Date().toISOString(),
          isOptimistic: true,
        },
      ]);

      socketRef.current.emit(
        'chat:send',
        { conversationId: convIdRef.current, message: trimmed, tempId },
        () => setIsSending(false),
      );

      setTimeout(() => setIsSending(false), 5000);
    },
    [isSending],
  );

  const startNewConversation = useCallback(() => {
    if (!socketRef.current) return;
    convIdRef.current = null;
    setConvReady(false);
    setConvStatus('pending');
    setMessages([WELCOME]);
    socketRef.current.emit('chat:init', { forceNew: true });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        connected,
        socketStatus,
        convStatus,
        convReady,
        isSending,
        unreadCount,
        clearUnread,
        sendMessage,
        startNewConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
};
