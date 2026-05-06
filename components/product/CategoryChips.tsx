import React from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        gap: 10,
        alignItems: 'center',
      }}
    >
      {categories.map((c) => {
        const active = selected === c.id;

        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${c.name}${active ? ', selected' : ''}`}
          >
            <MotiView
              animate={{
                scale: active ? 1 : 0.97,
                backgroundColor: active ? colors.primary : colors.surfaceVariant,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              style={{
                height: 38,
                paddingHorizontal: 18,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                shadowColor: active ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: active ? 0.4 : 0,
                shadowRadius: 10,
                elevation: active ? 6 : 0,
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.75)',
                  }}
                />
              )}

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: active ? '700' : '500',
                  color: active ? '#fff' : colors.textSecondary,
                  letterSpacing: active ? 0.3 : 0.1,
                }}
              >
                {c.name}
              </Text>
            </MotiView>

            {/* Bottom accent line under active chip */}
            <MotiView
              animate={{
                opacity: active ? 1 : 0,
                scaleX: active ? 1 : 0.2,
              }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              style={{
                height: 2.5,
                borderRadius: 2,
                backgroundColor: colors.primary,
                marginTop: 4,
                marginHorizontal: 8,
              }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
