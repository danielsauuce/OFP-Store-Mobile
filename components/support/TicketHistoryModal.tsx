import { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { X, Ticket, ChevronRight, Clock, MessageSquare } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { getMyTicketsService, getTicketByIdService } from '@/services/supportService';

interface TicketReply {
  _id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: string;
}

interface TicketSummary {
  _id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt?: string;
}

interface TicketDetail extends TicketSummary {
  message: string;
  replies: TicketReply[];
}

interface TicketHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ticketKeys = {
  list: ['tickets'] as const,
  detail: (id: string) => ['tickets', id] as const,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#2563EB', bg: '#2563EB20' },
  in_progress: { label: 'In Progress', color: '#F59E0B', bg: '#F59E0B20' },
  resolved: { label: 'Resolved', color: '#10B981', bg: '#10B98120' },
  closed: { label: 'Closed', color: '#6B7280', bg: '#6B728020' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: config.bg }}>
      <Text className="text-xs font-semibold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

export default function TicketHistoryModal({ visible, onClose }: TicketHistoryModalProps) {
  const { colors } = useTheme();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setSelectedTicketId(null);
    }
  }, [visible]);

  const { data: tickets = [], isLoading: loading } = useQuery<TicketSummary[]>({
    queryKey: ticketKeys.list,
    queryFn: async () => {
      const res = await getMyTicketsService();
      const list: TicketSummary[] = res?.tickets ?? res?.data ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
    enabled: visible,
    staleTime: 0,
  });

  const { data: selectedTicket, isLoading: loadingDetail } = useQuery<TicketDetail | null>({
    queryKey: ticketKeys.detail(selectedTicketId!),
    queryFn: async () => {
      const res = await getTicketByIdService(selectedTicketId!);
      return res?.ticket ?? res ?? null;
    },
    enabled: !!selectedTicketId,
    staleTime: 0,
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <View className="flex-row items-center gap-2">
            {selectedTicketId && (
              <TouchableOpacity onPress={() => setSelectedTicketId(null)} className="mr-1">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {selectedTicketId ? 'Ticket Detail' : 'My Tickets'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loadingDetail ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : selectedTicket ? (
          /* Ticket Detail View */
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold flex-1 mr-3" style={{ color: colors.text }}>
                  {selectedTicket.subject}
                </Text>
                <StatusBadge status={selectedTicket.status} />
              </View>
              <View className="flex-row items-center gap-1.5">
                <Clock size={12} color={colors.textTertiary} />
                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                  {formatDate(selectedTicket.createdAt)} at {formatTime(selectedTicket.createdAt)}
                </Text>
              </View>
            </View>

            {/* Original message */}
            <View className="p-4 rounded-2xl gap-1" style={{ backgroundColor: colors.primary + '10' }}>
              <Text className="text-xs font-semibold uppercase" style={{ color: colors.primary }}>
                Your message
              </Text>
              <Text className="text-sm leading-5" style={{ color: colors.text }}>
                {selectedTicket.message}
              </Text>
            </View>

            {/* Replies */}
            {selectedTicket.replies?.length > 0 && (
              <View className="gap-3">
                <Text className="text-sm font-bold" style={{ color: colors.text }}>
                  Replies ({selectedTicket.replies.length})
                </Text>
                {selectedTicket.replies.map((reply) => {
                  const isAdmin = reply.sender === 'admin';
                  return (
                    <View
                      key={reply._id}
                      className="p-4 rounded-2xl gap-1"
                      style={{
                        backgroundColor: isAdmin ? colors.surface : colors.primary + '10',
                        borderWidth: isAdmin ? 1 : 0,
                        borderColor: colors.border,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: isAdmin ? colors.textSecondary : colors.primary }}
                        >
                          {isAdmin ? 'Support Team' : 'You'}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                          {formatDate(reply.createdAt)}
                        </Text>
                      </View>
                      <Text className="text-sm leading-5" style={{ color: colors.text }}>
                        {reply.text}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {selectedTicket.replies?.length === 0 && (
              <View className="items-center py-6 gap-2">
                <MessageSquare size={32} color={colors.border} />
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  No replies yet. Our team will respond soon.
                </Text>
              </View>
            )}
          </ScrollView>
        ) : loading ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : tickets.length === 0 ? (
          /* Empty state */
          <View className="flex-1 items-center justify-center gap-3">
            <Ticket size={48} color={colors.border} />
            <Text className="font-semibold text-lg" style={{ color: colors.text }}>
              No support tickets
            </Text>
            <Text className="text-sm text-center px-8" style={{ color: colors.textSecondary }}>
              When you contact support, your tickets will appear here
            </Text>
          </View>
        ) : (
          /* Ticket List */
          <FlatList
            data={tickets}
            keyExtractor={(t) => t._id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-4 rounded-2xl gap-2"
                style={{ backgroundColor: colors.surface }}
                onPress={() => setSelectedTicketId(item._id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <Text
                    className="font-semibold text-sm flex-1 mr-3"
                    style={{ color: colors.text }}
                    numberOfLines={2}
                  >
                    {item.subject}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={12} color={colors.textTertiary} />
                    <Text className="text-xs" style={{ color: colors.textTertiary }}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.textTertiary} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
