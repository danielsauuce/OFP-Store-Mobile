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
  const buttonStyles = isDisabled ? 'bg-gray-200' : 'bg-indigo-500';
  const textStyles = isDisabled ? 'text-gray-400' : 'text-white';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`h-[52px] rounded-[14px] items-center justify-center mt-4 ${buttonStyles}`}
    >
      {loading ? (
        <ActivityIndicator color="#6366F1" />
      ) : (
        <Text className={`font-bold text-base ${textStyles}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export default AuthButton;
