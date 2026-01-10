// components/AuthInput.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/color';

export type AuthInputLabel = 'email' | 'password' | 'name' | 'confirmPassword';

export type AuthInputProps = {
  label: AuthInputLabel;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  editable?: boolean;
};

export default function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  showToggle = false,
  editable = true,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getLabelText = () => {
    switch (label) {
      case 'email':
        return 'Email';
      case 'password':
        return 'Password';
      case 'confirmPassword':
        return 'Confirm Password';
      case 'name':
        return 'Full Name';
      default:
        return '';
    }
  };

  return (
    <View className="mv-4">
      <Text className="text-[14px] font-semibold mb-1">{getLabelText()}</Text>
      <View className="flex-row items-center border rounded-[14px] px-4 h-[52px] bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border">
        <TextInput className="flex-1 text-[15px] font-medium text-light-text dark:text-dark-text" />
      </View>
    </View>
  );
}
