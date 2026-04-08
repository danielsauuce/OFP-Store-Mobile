import { useTheme } from '@/contexts/ThemeContext';
import { MotiView } from 'moti';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface Props {
  count: number;
  active: number;
  onPress: (i: number) => void;
}

export default function ImageDots({ count, active, onPress }: Props) {
  const { colors } = useTheme();
  if (count <= 1) return null;
  return (
    <View className="flex-row justify-center gap-1.5 pt-3.5 pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onPress(i)}>
          <MotiView
            animate={{
              width: i === active ? 20 : 7,
              backgroundColor: i === active ? colors.primary : colors.border,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            style={{ height: 7, borderRadius: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
