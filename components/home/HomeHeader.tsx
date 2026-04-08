import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, Hand, Bell } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCountService } from '@/services/notificationsService';
import { useNotifications } from '@/contexts/NotificationsContext';

interface HomeHeaderProps {
  firstName: string | null;
  onCartPress: () => void;
}

export default function HomeHeader({ firstName, onCartPress }: HomeHeaderProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const { unreadCount: socketUnread } = useNotifications();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: getUnreadCountService,
    enabled: !!user,
    refetchInterval: 60_000,
    staleTime: 3 * 60 * 1000,
  });

  const unreadCount = Math.max(socketUnread, unreadData?.count ?? 0);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      className="px-5 pt-4 pb-2 flex-row justify-between items-center"
    >
      <View>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {firstName ? `Hi, ${firstName}` : 'Welcome'}
          </Text>
          {firstName && <Hand size={20} color={colors.primary} />}
        </View>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          Furniture Palace
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        {/* Bell */}
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <Bell size={20} color={colors.text} />
          {unreadCount > 0 && (
            <View
              className="absolute top-1 right-1 min-w-4 h-4 rounded-full items-center justify-center px-0.5"
              style={{ backgroundColor: colors.badge }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 9 }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity
          onPress={onCartPress}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <ShoppingBag size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}
