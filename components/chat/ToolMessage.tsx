import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ToolPart {
  state: 'input-streaming' | 'output-available' | 'output-error';
  errorText?: string;
}

interface Props {
  part: ToolPart;
}

export default function ToolMessage({ part }: Props) {
  const { colors } = useTheme();

  if (part.state === 'input-streaming') {
    return (
      <View className="flex-row items-center gap-2 mt-1">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text className="text-xs opacity-60" style={{ color: colors.text }}>
          Processing...
        </Text>
      </View>
    );
  }

  if (part.state === 'output-available') {
    return (
      <View className="flex-row items-center gap-1 mt-1">
        <CheckCircle size={12} color={colors.success} />
        <Text className="text-xs opacity-60" style={{ color: colors.text }}>
          Done
        </Text>
      </View>
    );
  }

  if (part.state === 'output-error') {
    return (
      <Text className="text-xs mt-1" style={{ color: colors.error }}>
        {part.errorText}
      </Text>
    );
  }

  return null;
}
