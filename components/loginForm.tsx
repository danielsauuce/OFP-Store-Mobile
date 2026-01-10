import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { LoginFormProps } from '@/types/authTypes';

export default function LoginFormScreen({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
  onForgotPassword,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <View></View>
    </>
  );
}
