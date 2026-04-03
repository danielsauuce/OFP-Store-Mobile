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
                const isMe = user && msg.sender._id === user.id;
                return (
                  <View key={msg._id} style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.textSecondary,
                        marginBottom: 3,
                        marginHorizontal: 4,
                      }}
                    >
                      {isMe ? 'You' : msg.sender.fullName} · {timeAgo(msg.createdAt)}
                    </Text>
                    <View
                      style={{
                        maxWidth: '78%',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 18,
                        borderBottomRightRadius: isMe ? 4 : 18,
                        borderBottomLeftRadius: isMe ? 18 : 4,
                        backgroundColor: isMe ? colors.primary : colors.surface,
                        borderWidth: isMe ? 0 : 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          lineHeight: 20,
                          color: isMe ? '#fff' : colors.text,
                        }}
                      >
                        {msg.content}
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
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.primary + '18',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MessageSquare size={16} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                        Support Chat
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Clock size={11} color={colors.textSecondary} />
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>
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
                    style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 44 }}
                  >
                    {item.lastMessage.content}
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
