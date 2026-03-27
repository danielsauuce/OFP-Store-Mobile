import React from 'react';
import { View } from 'react-native';
import SkeletonProductCard from './SkeletonProductCard';

interface SkeletonProductGridProps {
  count?: number;
}

export default function SkeletonProductGrid({ count = 6 }: SkeletonProductGridProps) {
  return (
    <View className="flex-row flex-wrap justify-between px-5 gap-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </View>
  );
}
