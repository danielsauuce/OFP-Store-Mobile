import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryChips({ categories, selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-3">
      <View className="flex-row gap-2">
        {categories.map((c) => {
          const active = selected === c.id;

          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => onSelect(c.id)}
              className="px-5 py-2 rounded-full border"
              style={{
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text className="font-semibold" style={{ color: active ? '#fff' : colors.text }}>
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
