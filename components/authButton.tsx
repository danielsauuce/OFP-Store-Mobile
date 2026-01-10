import React from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  isloading: boolean;
  disable?: boolean;
};

export default function AuthButton({ label, onPress, isloading = false, disable = false }: AuthButtonProps) {
  const isDisable = isloading || disable;

  const buttonStyles = isDisable
    ? 'bg-light-surface-variant dark:bg-dark-surface-variant'
    : 'bg-light-primary dark:bg-dark-primary';

  const textStyles = isDisable
    ? 'text-light-text-tertiary dark:text-dark-text-tertiary'
    : 'text-light-surface dark:text-dark-surface';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisable}
      className={`h-[52px] rounded-[14px] items-center justify-center mt-4 ${buttonStyles}`}
    >
      {isloading ? (
        <ActivityIndicator color="#8B4513" />
      ) : (
        <Text className={`font-bold text-base ${textStyles}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
