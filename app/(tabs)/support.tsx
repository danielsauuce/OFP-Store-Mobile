import ChatInput from '@/components/chat/ChatInput';
import ChatMessageList from '@/components/support/ChatMessageList';
import SupportHeader from '@/components/support/SupportHeader';
import TicketHistoryModal from '@/components/support/TicketHistoryModal';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
  const { user } = useAuth();
  const {
    messages,
    connected,
    socketStatus,
    convReady,
    isSending,
    clearUnread,
    sendMessage,
    startNewConversation,
  } = useChat();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Mark support tab as open so unread count doesn't increment while visible
  useEffect(() => {
    clearUnread();
    return () => {
      // When unmounting (tab switched away) — context tracks via supportOpenRef
    };
  }, [clearUnread]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !connected || !convReady) return;
    sendMessage(text);
    setInput('');
  }, [input, connected, convReady, sendMessage]);

  const isReady = socketStatus === 'ready' || (socketStatus === 'connecting' && connected);

  // Don't render socket-dependent UI until user is authenticated
  if (!user) return null;

  return (
    <SafeAreaView className="flex-1" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SupportHeader
          onViewHistory={() => setShowHistory(true)}
          onNewChat={isReady ? startNewConversation : undefined}
          connected={connected}
        />

        <ChatMessageList messages={messages} loading={isSending} />

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={!connected || !convReady}
        />
      </KeyboardAvoidingView>

      <TicketHistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
    </SafeAreaView>
  );
}
