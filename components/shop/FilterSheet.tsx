import { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export interface FilterState {
  sort: SortOption;
  minPrice: string;
  maxPrice: string;
}

export const DEFAULT_FILTERS: FilterState = {
  sort: 'newest',
  minPrice: '',
  maxPrice: '',
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

interface FilterSheetProps {
  visible: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

export default function FilterSheet({ visible, filters, onApply, onClose }: FilterSheetProps) {
  const { colors } = useTheme();
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible, filters]);

  const set = (key: keyof FilterState) => (value: string) => setLocal((f) => ({ ...f, [key]: value }));

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleReset = () => {
    setLocal(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
    onClose();
  };

  const activeCount =
    (local.sort !== 'newest' ? 1 : 0) +
    (local.minPrice !== '' ? 1 : 0) +
    (local.maxPrice !== '' ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Filter & Sort
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }} showsVerticalScrollIndicator={false}>
          {/* Sort */}
          <View className="gap-3">
            <Text className="text-sm font-bold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
              Sort By
            </Text>
            <View className="gap-2">
              {SORT_OPTIONS.map((opt) => {
                const active = local.sort === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    className="flex-row items-center justify-between px-4 h-12 rounded-xl"
                    style={{
                      backgroundColor: active ? colors.primary + '15' : colors.surface,
                      borderWidth: active ? 1.5 : 1,
                      borderColor: active ? colors.primary : colors.border,
                    }}
                    onPress={() => setLocal((f) => ({ ...f, sort: opt.value }))}
                  >
                    <Text
                      className="font-medium text-sm"
                      style={{ color: active ? colors.primary : colors.text }}
                    >
                      {opt.label}
                    </Text>
                    {active && <Check size={16} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price Range */}
          <View className="gap-3">
            <Text className="text-sm font-bold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
              Price Range
            </Text>
            <View className="flex-row gap-3 items-center">
              <View className="flex-1 gap-1">
                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                  Min price
                </Text>
                <TextInput
                  value={local.minPrice}
                  onChangeText={set('minPrice')}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: local.minPrice ? colors.primary : colors.border,
                    borderWidth: local.minPrice ? 1.5 : 1,
                    color: colors.text,
                  }}
                />
              </View>
              <Text className="text-base mt-4" style={{ color: colors.textTertiary }}>
                —
              </Text>
              <View className="flex-1 gap-1">
                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                  Max price
                </Text>
                <TextInput
                  value={local.maxPrice}
                  onChangeText={set('maxPrice')}
                  placeholder="Any"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: local.maxPrice ? colors.primary : colors.border,
                    borderWidth: local.maxPrice ? 1.5 : 1,
                    color: colors.text,
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View className="px-5 pb-8 pt-3 gap-3" style={{ borderTopWidth: 1, borderColor: colors.border }}>
          <TouchableOpacity
            className="h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            onPress={handleApply}
          >
            <Text className="text-white font-semibold text-base">
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </TouchableOpacity>
          {activeCount > 0 && (
            <TouchableOpacity
              className="h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              onPress={handleReset}
            >
              <Text className="font-semibold text-base" style={{ color: colors.text }}>
                Reset Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
