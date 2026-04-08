import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { extractProductImageUrl } from '@/utils/imageUtils';

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  primaryImage?: { secureUrl?: string; url?: string };
}

interface CartItemData {
  _id: string;
  product: CartProduct;
  quantity: number;
  priceSnapshot: number;
  variantSku?: string;
  nameSnapshot?: string;
}

interface Props {
  item: CartItemData;
  index?: number;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}

function parseVariant(sku?: string): { color?: string; size?: string } {
  if (!sku) return {};
  // Variant SKU might be like "black-xl" or "Black / XL"
  const parts = sku.split(/[-/]/).map((s) => s.trim());
  if (parts.length >= 2) return { color: parts[0], size: parts[1] };
  return {};
}

export default function CartItem({ item, index = 0, onUpdate, onRemove }: Props) {
  const { colors } = useTheme();
  const variant = parseVariant(item.variantSku);
  const imageUri = extractProductImageUrl(item);

  return (
    <MotiView
      from={{ opacity: 0, translateX: 30 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 180, delay: index * 60 }}
      style={{
        flexDirection: 'row',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
      }}
    >
      {/* Product image — larger like reference */}
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.border,
        }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 110, height: 110 }} contentFit="cover" />
        ) : null}
      </View>

      {/* Details */}
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        {/* Name + delete */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text
            style={{ fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 }}
            numberOfLines={2}
          >
            {item.nameSnapshot ?? item.product.name}
          </Text>
          <TouchableOpacity
            onPress={onRemove}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.error + '12',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 size={15} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Variant info */}
        {(variant.color || variant.size) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            {variant.color && (
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Color: <Text style={{ fontWeight: '600', color: colors.text }}>{variant.color}</Text>
              </Text>
            )}
            {variant.color && variant.size && <Text style={{ color: colors.border }}>|</Text>}
            {variant.size && (
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Size:{' '}
                <Text style={{ fontWeight: '600', color: colors.text }}>{variant.size.toUpperCase()}</Text>
              </Text>
            )}
          </View>
        )}

        {/* Price + quantity */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
            {formatCurrency(item.priceSnapshot || 0)}
          </Text>

          {/* Quantity controls */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <TouchableOpacity onPress={() => onUpdate(Math.max(1, item.quantity - 1))} style={{ padding: 4 }}>
              <Minus size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                minWidth: 16,
                textAlign: 'center',
              }}
            >
              {item.quantity}
            </Text>

            <TouchableOpacity onPress={() => onUpdate(item.quantity + 1)} style={{ padding: 4 }}>
              <Plus size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
