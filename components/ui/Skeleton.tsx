import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Skeleton as MotiSkeleton } from 'moti/skeleton';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width = '100%', height, radius = 8, style }: SkeletonProps) {
  const { isDark } = useTheme();
  return (
    <MotiSkeleton colorMode={isDark ? 'dark' : 'light'} width={width} height={height} radius={radius}>
      <View style={[{ width: width as number, height, borderRadius: radius }, style]} />
    </MotiSkeleton>
  );
}
