import React from 'react';
import { View } from 'react-native';
import { Skeleton as MotiSkeleton } from 'moti/skeleton';
import { useTheme } from '@/contexts/ThemeContext';

export default function SkeletonProductCard() {
  const { isDark, colors } = useTheme();
  const colorMode = isDark ? 'dark' : 'light';

  return (
    <View className="w-[48%] rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
      <MotiSkeleton colorMode={colorMode} width="100%" height={160} radius={0}>
        <View style={{ width: '100%', height: 160 }} />
      </MotiSkeleton>

      <View className="p-3 gap-2">
        <MotiSkeleton colorMode={colorMode} width={56} height={10} radius={4}>
          <View style={{ width: 56, height: 10 }} />
        </MotiSkeleton>

        <MotiSkeleton colorMode={colorMode} width="85%" height={13} radius={4}>
          <View style={{ width: '85%', height: 13 }} />
        </MotiSkeleton>

        <MotiSkeleton colorMode={colorMode} width="60%" height={13} radius={4}>
          <View style={{ width: '60%', height: 13 }} />
        </MotiSkeleton>

        <View className="flex-row justify-between items-center mt-1">
          <MotiSkeleton colorMode={colorMode} width={64} height={14} radius={4}>
            <View style={{ width: 64, height: 14 }} />
          </MotiSkeleton>
          <MotiSkeleton colorMode={colorMode} width={48} height={20} radius={4}>
            <View style={{ width: 48, height: 20 }} />
          </MotiSkeleton>
        </View>
      </View>
    </View>
  );
}
