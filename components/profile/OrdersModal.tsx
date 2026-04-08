import { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { extractProductImageUrl } from '@/utils/imageUtils';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  confirmed: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              const statusLabel = STATUS_LABELS[item.status] ?? item.status;
              const canCancel = item.status === 'pending' || item.status === 'processing';
              // Collect up to 4 product images with proper extraction logic
              const thumbs = item.items
                .map((i) => extractProductImageUrl(i))
                .filter(Boolean)
                .slice(0, 4) as string[];

              return (
                <View className="p-4 rounded-2xl gap-3" style={{ backgroundColor: colors.surface }}>
                  {/* Header row — order ref + status */}
                  <View className="flex-row justify-between items-center">
                    <Text className="font-bold text-sm" style={{ color: colors.text }}>
                      {item.orderNumber ? `#${item.orderNumber}` : `#${item._id.slice(-8).toUpperCase()}`}
                    </Text>
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusColor + '20' }}>
                      <Text className="text-xs font-semibold capitalize" style={{ color: statusColor }}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Product thumbnails */}
                  {thumbs.length > 0 && (
                    <View className="flex-row gap-2">
                      {thumbs.map((uri, idx) => (
                        <View
                          key={idx}
                          className="w-14 h-14 rounded-xl overflow-hidden"
                          style={{ backgroundColor: colors.surfaceVariant }}
                        >
                          <Image source={{ uri }} className="w-14 h-14" contentFit="cover" />
                        </View>
                      ))}
                      {item.items.length > 4 && (
                        <View
                          className="w-14 h-14 rounded-xl items-center justify-center"
                          style={{ backgroundColor: colors.surfaceVariant }}
                        >
                          <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                            +{item.items.length - 4}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Item names */}
                  <Text className="text-xs" numberOfLines={2} style={{ color: colors.textSecondary }}>
                    {item.items
                      .map((i) => i.nameSnapshot ?? i.product.name)
                      .filter(Boolean)
                      .join(', ')}
                  </Text>

                  {/* Date · items · total */}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs" style={{ color: colors.textTertiary }}>
                      {new Date(item.createdAt).toLocaleDateString()} · {item.items.length}{' '}
                      {item.items.length === 1 ? 'item' : 'items'}
                    </Text>
                    <Text className="font-bold" style={{ color: colors.primary }}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>

                  {canCancel && (
                    <TouchableOpacity onPress={() => cancelOrder(item._id)} className="self-end">
                      <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                        Cancel Order
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
