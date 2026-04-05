import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  label: string;
  value: string;
}

export default function SpecRow({ label, value }: Props) {
  const { colors } = useTheme();
  return (
    <View className="flex-row justify-between">
      <Text className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text className="text-[13px]" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}
