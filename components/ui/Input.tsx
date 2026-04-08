import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  secure?: boolean;
  error?: string;
}

export const Input = ({ label, icon, secure = false, error, ...props }: InputProps) => {
  const [show, setShow] = useState(false);

  return (
    <View className="gap-2">
      {label && <Text className="text-sm font-semibold text-gray-500">{label}</Text>}

      <View className="flex-row items-center border border-gray-300 rounded-xl px-4 h-[52px] bg-white gap-3">
        {icon}

        <TextInput className="flex-1 text-base text-black" secureTextEntry={secure && !show} {...props} />

        {secure && (
          <TouchableOpacity
            onPress={() => setShow(!show)}
            accessibilityRole="button"
            accessibilityLabel={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  );
};
