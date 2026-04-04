import React, { useState } from 'react';
import { ScrollView, Pressable, Text } from 'react-native';
import { MotiView } from 'moti';
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
  const [pressed, setPressed] = useState<string | null>(null);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 8 }}
    >
      {categories.map((c) => {
        const active = selected === c.id;

        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            onPressIn={() => setPressed(c.id)}
            onPressOut={() => setPressed(null)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${c.name}${active ? ', selected' : ''}`}
          >
            <MotiView
              animate={{
                scale: pressed === c.id ? 0.94 : 1,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="px-[18px] py-2 rounded-full"
              style={{
                borderWidth: active ? 0 : 1,
                borderColor: colors.border,
                shadowColor: active ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: active ? 0.28 : 0,
                shadowRadius: 6,
                elevation: active ? 4 : 0,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: active ? '#fff' : colors.textSecondary }}
              >
                {c.name}
              </Text>
            </MotiView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
