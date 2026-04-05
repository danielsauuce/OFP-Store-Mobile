import React from 'react';
import { TouchableOpacity } from 'react-native';

const FLOAT_BTN_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.92)',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
} as const;

interface Props {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function FloatButton({ onPress, disabled, children }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="w-[42px] h-[42px] rounded-full items-center justify-center"
      style={FLOAT_BTN_STYLE}
    >
      {children}
    </TouchableOpacity>
  );
}
