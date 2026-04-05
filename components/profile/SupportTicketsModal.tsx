import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Ticket, ChevronRight, Send, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMyTicketsService,
  getTicketByIdService,
  createTicketService,
  replyToTicketService,
  SupportTicket,
  TicketStatus,
} from '@/services/supportTicketService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: '#3B82F6',
  in_progress: '#F59E0B',
  resolved: '#10B981',
  closed: '#6B7280',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

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

function StatusBadge({ status }: { status: TicketStatus }) {
  const color = STATUS_COLORS[status] ?? '#6B7280';
  return (
    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20' }}>
      <Text className="text-[10px] font-bold" style={{ color }}>
        {STATUS_LABELS[status] ?? status}
      </Text>
    </View>
  );
}

// ── Create Ticket Form ────────────────────────────────────────────────────────
function CreateTicketForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const create = useMutation({
    mutationFn: () => createTicketService({ subject: subject.trim(), message: message.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support', 'tickets'] });
      onCreated();
    },
    onError: (e: unknown) => {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create ticket');
    },
  });

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
          Subject
        </Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief summary of your issue"
          placeholderTextColor={colors.textTertiary}
          returnKeyType="next"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 14,
            color: colors.text,
          }}
        />

        <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
          Description
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue in detail…"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 14,
            color: colors.text,
            minHeight: 120,
          }}
        />

        <TouchableOpacity
          onPress={() => create.mutate()}
          disabled={!canSubmit || create.isPending}
          className="h-12 rounded-2xl items-center justify-center mt-2"
          style={{ backgroundColor: canSubmit ? colors.primary : colors.border }}
        >
          {create.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-sm">Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Ticket Detail View ────────────────────────────────────────────────────────
function TicketDetail({ ticketId, userId }: { ticketId: string; userId: string }) {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['support', 'ticket', ticketId],
    queryFn: () => getTicketByIdService(ticketId),
    staleTime: 0,
  });

  const ticket = data?.ticket;

  const sendReply = useMutation({
    mutationFn: () => replyToTicketService(ticketId, reply.trim()),
    onSuccess: () => {
      setReply('');
      qc.invalidateQueries({ queryKey: ['support', 'ticket', ticketId] });
    },
    onError: (e: unknown) => {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not send reply');
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!ticket) return null;

  const canReply = ticket.status !== 'resolved' && ticket.status !== 'closed';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      {/* Status row */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: colors.border }}
      >
        <Text className="text-sm font-semibold flex-1 mr-2" numberOfLines={1} style={{ color: colors.text }}>
          {ticket.subject}
        </Text>
        <StatusBadge status={ticket.status} />
      </View>

      {/* Messages */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {ticket.replies.map((reply) => {
          const isMe = reply.author === userId;
          return (
            <View key={reply._id} style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <Text className="text-[11px] mb-[3px] mx-1" style={{ color: colors.textSecondary }}>
                {isMe ? 'You' : 'Support'} · {timeAgo(reply.createdAt)}
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
                  {reply.text}
                </Text>
              </View>
            </View>
          );
        })}
        {!canReply && (
          <Text className="text-xs text-center mt-2" style={{ color: colors.textTertiary }}>
            This ticket is {ticket.status}. No further replies allowed.
          </Text>
        )}
      </ScrollView>

      {/* Reply input */}
      {canReply && (
        <View
          className="flex-row items-end gap-2 px-4 pt-3 pb-5 border-t"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Type a reply…"
            placeholderTextColor={colors.textTertiary}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 9,
              fontSize: 14,
              color: colors.text,
              maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={() => sendReply.mutate()}
            disabled={!reply.trim() || sendReply.isPending}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: reply.trim() ? colors.primary : colors.border }}
          >
            {sendReply.isPending ? (
              <ActivityIndicator size={14} color="#fff" />
            ) : (
              <Send size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
type View = 'list' | 'create' | 'detail';

export default function SupportTicketsModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['support', 'tickets'],
    queryFn: getMyTicketsService,
    enabled: visible,
    staleTime: 0,
  });

  const tickets: SupportTicket[] = data?.tickets ?? [];

  const handleClose = () => {
    setView('list');
    setSelectedId(null);
    onClose();
  };

  const handleBack = () => {
    if (view === 'detail' || view === 'create') {
      setView('list');
      setSelectedId(null);
    }
  };

  const headerTitle =
    view === 'create' ? 'New Ticket' : view === 'detail' ? 'Ticket Detail' : 'Support Tickets';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center gap-2">
            {view !== 'list' && (
              <TouchableOpacity onPress={handleBack} className="mr-1">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {headerTitle}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            {view === 'list' && (
              <TouchableOpacity
                onPress={() => setView('create')}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: colors.primary + '18' }}
              >
                <Plus size={13} color={colors.primary} />
                <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                  New
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {view === 'create' ? (
          <CreateTicketForm onCreated={() => setView('list')} onCancel={() => setView('list')} />
        ) : view === 'detail' && selectedId ? (
          <TicketDetail ticketId={selectedId} userId={user?.id ?? ''} />
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : tickets.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 px-8">
            <Ticket size={48} color={colors.border} />
            <Text className="font-bold text-lg text-center" style={{ color: colors.text }}>
              No support tickets
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
              Create a ticket if you have an issue and our team will get back to you.
            </Text>
            <TouchableOpacity
              onPress={() => setView('create')}
              className="mt-2 px-5 py-2.5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-sm">Create Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(t) => t._id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedId(item._id);
                  setView('detail');
                }}
                activeOpacity={0.7}
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-start justify-between gap-2 mb-1.5">
                  <Text className="text-sm font-bold flex-1" numberOfLines={1} style={{ color: colors.text }}>
                    {item.subject}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px]" style={{ color: colors.textTertiary }}>
                    {timeAgo(item.updatedAt ?? item.createdAt)} · {item.replies.length} repl
                    {item.replies.length !== 1 ? 'ies' : 'y'}
                  </Text>
                  <ChevronRight size={15} color={colors.textTertiary} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
