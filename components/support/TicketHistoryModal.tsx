import { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { X, MessageSquare, ChevronRight, Clock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConversationsService,
  getMessagesService,
  Conversation,
  ChatMessage,
} from '@/services/chatService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TicketHistoryModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) setSelectedId(null);
  }, [visible]);

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['chat', 'conversations', 'history'],
    queryFn: async () => {
      try {
        const res = await getConversationsService();
        const list = res?.conversations ?? res ?? [];
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    enabled: visible,
    staleTime: 0,
  });

  const { data: messages = [], isLoading: loadingMsgs } = useQuery<ChatMessage[]>({
    queryKey: ['chat', 'messages', selectedId],
    queryFn: async () => {
      const res = await getMessagesService(selectedId!, 1, 100);
      const list = res?.messages ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!selectedId,
    staleTime: 0,
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center gap-2">
            {selectedId && (
              <TouchableOpacity onPress={() => setSelectedId(null)} className="mr-1">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {selectedId ? 'Conversation' : 'Chat History'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages view */}
        {selectedId ? (
          loadingMsgs ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
              {messages.map((msg) => {
                const senderId = msg.sender.userId ?? msg.sender._id;
                const isMe = user && senderId === user.id;
                return (
                  <View key={msg._id} style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <Text className="text-[11px] mb-[3px] mx-1" style={{ color: colors.textSecondary }}>
                      {isMe ? 'You' : msg.sender.fullName} · {timeAgo(msg.createdAt)}
                    </Text>
                    <View
                      className="px-3.5 py-2.5"
                      style={{
                        maxWidth: '78%',
                        borderRadius: 18,
                        borderBottomRightRadius: isMe ? 4 : 18,
                        borderBottomLeftRadius: isMe ? 18 : 4,
                        backgroundColor: isMe ? colors.primary : colors.surface,
                        borderWidth: isMe ? 0 : 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text className="text-sm leading-5" style={{ color: isMe ? '#fff' : colors.text }}>
                        {msg.message}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 px-8">
            <MessageSquare size={48} color={colors.border} />
            <Text className="font-bold text-lg text-center" style={{ color: colors.text }}>
              No conversations yet
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
              Start a chat and your conversation history will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c._id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedId(item._id)}
                activeOpacity={0.7}
                className="p-4 rounded-2xl gap-1.5"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary + '18' }}
                    >
                      <MessageSquare size={16} color={colors.primary} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold" style={{ color: colors.text }}>
                        Support Chat
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Clock size={11} color={colors.textSecondary} />
                        <Text className="text-[11px]" style={{ color: colors.textSecondary }}>
                          {timeAgo(item.updatedAt ?? item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>

                {item.lastMessage && (
                  <Text
                    numberOfLines={1}
                    className="text-[13px] ml-11"
                    style={{ color: colors.textSecondary }}
                  >
                    {item.lastMessage.message}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
