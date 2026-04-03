import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Bell,
  ShoppingBag,
  CreditCard,
  Star,
  MessageCircle,
  Info,
  CheckCheck,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  AppNotification,
} from '@/services/notificationsService';

const TYPE_CONFIG: Record<
  AppNotification['type'],
  { Icon: React.ComponentType<{ size: number; color: string }>; color: string }
> = {
  order: { Icon: ShoppingBag, color: '#3B82F6' },
  payment: { Icon: CreditCard, color: '#10B981' },
  review: { Icon: Star, color: '#F59E0B' },
  chat: { Icon: MessageCircle, color: '#8B5CF6' },
  system: { Icon: Info, color: '#6B7280' },
};

function NotificationCard({
  item,
  onRead,
  index,
}: {
  item: AppNotification;
  onRead: (id: string) => void;
  index: number;
}) {
  const { colors } = useTheme();
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 40 }}
    >
      <TouchableOpacity
        onPress={() => !item.isRead && onRead(item._id)}
        activeOpacity={0.75}
        className="flex-row items-start mx-4 mb-3 p-4 rounded-2xl"
        style={{
          backgroundColor: item.isRead ? colors.surface : colors.primary + '0D',
          borderWidth: 1,
          borderColor: item.isRead ? colors.border : colors.primary + '30',
        }}
      >
        {/* Icon badge */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
          style={{ backgroundColor: config.color + '18' }}
        >
          <config.Icon size={18} color={config.color} />
        </View>

        {/* Content */}
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold flex-1 mr-2" style={{ color: colors.text }} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && (
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
            )}
          </View>

          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            {item.message}
          </Text>

          <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>
            {new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-start mx-4 mb-3 p-4 rounded-2xl"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="w-10 h-10 rounded-full mr-3" style={{ backgroundColor: colors.border }} />
      <View className="flex-1 gap-2">
        <View className="h-3.5 rounded-lg w-3/4" style={{ backgroundColor: colors.border }} />
        <View className="h-3 rounded-lg w-full" style={{ backgroundColor: colors.border }} />
        <View className="h-3 rounded-lg w-2/3" style={{ backgroundColor: colors.border }} />
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotificationsService(1, 50),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = useMutation({
    mutationFn: markAsReadService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: markAllAsReadService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleRead = useCallback((id: string) => markRead.mutate(id), [markRead]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>
          Notifications
        </Text>

        {unreadCount > 0 && !markAll.isPending && (
          <TouchableOpacity
            onPress={() => markAll.mutate()}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: colors.primary + '18' }}
          >
            <CheckCheck size={14} color={colors.primary} />
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count pill */}
      {unreadCount > 0 && (
        <View className="px-4 pt-3 pb-1">
          <View
            className="self-start px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.primary + '18' }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              {unreadCount} unread
            </Text>
          </View>
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View className="mt-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surfaceVariant }}
          >
            <Bell size={34} color={colors.textTertiary} />
          </View>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            All caught up
          </Text>
          <Text className="text-sm text-center px-8" style={{ color: colors.textSecondary }}>
            You have no notifications right now. Check back later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n._id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item, index }) => <NotificationCard item={item} onRead={handleRead} index={index} />}
        />
      )}
    </SafeAreaView>
  );
}
