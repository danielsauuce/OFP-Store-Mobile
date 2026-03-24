import { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatCurrency } from '@/utils/formatCurrency';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

interface OrdersModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OrdersModal({ visible, onClose }: OrdersModalProps) {
  const { colors } = useTheme();
  const { orders, loading, fetchOrders, cancelOrder } = useOrders();

  useEffect(() => {
    if (visible) fetchOrders();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            My Orders
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : orders.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2">
            <Text className="font-semibold text-lg" style={{ color: colors.text }}>
              No orders yet
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Your orders will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(o) => o._id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusColor = STATUS_COLORS[item.status] ?? colors.textSecondary;
              const canCancel = item.status === 'pending' || item.status === 'confirmed';
              return (
                <View className="p-4 rounded-2xl gap-2" style={{ backgroundColor: colors.surface }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-bold text-sm" style={{ color: colors.text }}>
                      #{item._id.slice(-8).toUpperCase()}
                    </Text>
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusColor + '20' }}>
                      <Text className="text-xs font-semibold capitalize" style={{ color: statusColor }}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {new Date(item.createdAt).toLocaleDateString()} · {item.items.length}{' '}
                    {item.items.length === 1 ? 'item' : 'items'}
                  </Text>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-bold" style={{ color: colors.primary }}>
                      {formatCurrency(item.total)}
                    </Text>
                    {canCancel && (
                      <TouchableOpacity onPress={() => cancelOrder(item._id)}>
                        <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
