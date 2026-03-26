import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthButton({ label, onPress, loading = false, disabled = false }: AuthButtonProps) {
  const isDisabled = loading || disabled;
  const buttonStyles = isDisabled
    ? 'bg-light-surface-variant dark:bg-dark-surface-variant'
    : 'bg-light-primary dark:bg-dark-primary';
  const textStyles = isDisabled
    ? 'text-light-text-tertiary dark:text-dark-text-tertiary'
    : 'text-light-surface dark:text-dark-surface';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`h-[52px] rounded-[14px] items-center justify-center mt-4 ${buttonStyles}`}
    >
      {loading ? (
        <ActivityIndicator color="#8B4513" />
      ) : (
        <Text className={`font-bold text-base ${textStyles}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export default AuthButton;
