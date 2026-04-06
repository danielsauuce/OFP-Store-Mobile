import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function ThumbnailStrip({ images, activeIndex, onSelect }: Props) {
  const { colors } = useTheme();
  if (images.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2 }}
    >
      {images.map((uri, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onSelect(i)}
          activeOpacity={0.75}
          style={{ marginRight: i < images.length - 1 ? 10 : 0 }}
        >
          <MotiView
            animate={{
              borderColor: i === activeIndex ? colors.primary : colors.border,
              borderWidth: i === activeIndex ? 2 : 1,
              opacity: i === activeIndex ? 1 : 0.65,
            }}
            transition={{ type: 'timing', duration: 150 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: colors.surfaceVariant,
            }}
          >
            <Image source={{ uri }} style={{ width: 64, height: 64 }} contentFit="cover" />
          </MotiView>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
