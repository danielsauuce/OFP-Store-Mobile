import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type AuthButtonProps = {
  title?: string;
  label?: string;
  onPress: () => void;
  loading?: boolean;
  isloading?: boolean;
  disable?: boolean;
};

export function AuthButton({
  title,
  label,
  onPress,
  loading = false,
  isloading = false,
  disable = false,
}: AuthButtonProps) {
  const buttonLabel = title || label || '';
  const isLoadingState = loading || isloading;
  const isDisable = isLoadingState || disable;

  const buttonStyles = isDisable ? 'bg-gray-200' : 'bg-indigo-500';

  const textStyles = isDisable ? 'text-gray-400' : 'text-white';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisable}
      className={`h-[52px] rounded-[14px] items-center justify-center mt-4 ${buttonStyles}`}
    >
      {isLoadingState ? (
        <ActivityIndicator color="#6366F1" />
      ) : (
        <Text className={`font-bold text-base ${textStyles}`}>{buttonLabel}</Text>
      )}
    </TouchableOpacity>
  );
}

export default AuthButton;
