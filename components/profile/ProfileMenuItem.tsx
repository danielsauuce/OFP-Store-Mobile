import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileMenuItemProps {
  Icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  labelColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  containerBg?: string;
  right?: React.ReactNode;
  isLast?: boolean;
}

export default function ProfileMenuItem({
  Icon,
  iconColor,
  iconBg,
  label,
  labelColor,
  onPress,
  disabled,
  containerBg,
  right,
  isLast,
}: ProfileMenuItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 rounded-2xl${isLast ? ' mb-6' : ''}`}
      style={{ backgroundColor: containerBg ?? colors.surface }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <Text className="flex-1 font-semibold" style={{ color: labelColor ?? colors.text }}>
        {label}
      </Text>
      {right ?? null}
    </TouchableOpacity>
  );
}
