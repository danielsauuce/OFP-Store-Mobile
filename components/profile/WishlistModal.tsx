import { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { X, Heart, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatCurrency } from '@/utils/formatCurrency';

interface WishlistModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WishlistModal({ visible, onClose }: WishlistModalProps) {
  const { colors } = useTheme();
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (visible) fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleProductPress = (id: string) => {
    onClose();
    router.push(`/product/${id}`);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Wishlist
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3">
            <Heart size={48} color={colors.border} />
            <Text className="font-semibold text-lg" style={{ color: colors.text }}>
              Your wishlist is empty
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Save items you love to your wishlist
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i._id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const imageUri = item.product.images?.[0];
              return (
                <TouchableOpacity
                  className="flex-row items-center gap-3 p-3 rounded-2xl"
                  style={{ backgroundColor: colors.surface }}
                  onPress={() => handleProductPress(item.product._id)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-16 h-16 rounded-xl overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    {imageUri && (
                      <Image
                        source={{ uri: imageUri }}
                        style={{ width: 64, height: 64 }}
                        contentFit="cover"
                      />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="font-semibold text-sm" numberOfLines={2} style={{ color: colors.text }}>
                      {item.product.name}
                    </Text>
                    <Text className="font-bold mt-1" style={{ color: colors.primary }}>
                      {formatCurrency(item.product.price)}
                    </Text>
                    {!item.product.inStock && (
                      <Text className="text-xs mt-0.5" style={{ color: colors.error }}>
                        Out of stock
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    className="p-2"
                    onPress={() => removeFromWishlist(item.product._id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
