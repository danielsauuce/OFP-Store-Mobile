import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LoginFormScreen from '@/components/loginForm';
import AuthButton from '@/components/authButton';
import { useRouter } from 'expo-router';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('login');

  const handleLogin = () => {
    setLoading(true);
    router.push('/');
    setLoading(false);
  };
  const [loading, setLoading] = useState(false);

  const headerTitle =
    mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password';

  const headerSubtitle =
    mode === 'login'
      ? 'Sign in to continue shopping'
      : mode === 'signup'
        ? 'Join us to start shopping'
        : 'Enter your email and new password';

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-light-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow px-5 pb-10"
        contentContainerStyle={{ paddingTop: insets.top + 40 }}
      >
        <View className="items-center mb-10">
          <Text className="text-[40px] font-bold tracking-[0.5px] text-light-primary">Olayinka</Text>
          <Text className="text-[13px] tracking-[2px] uppercase mt-1 text-light-secondary">
            Furniture Palace
          </Text>
        </View>

        <View className="rounded-[20px] p-7 shadow-lg bg-light-surface dark:bg-dark-surface">
          <View className="mb-8">
            <Text className="text-[28px] font-bold mb-2 text-light-text dark:text-dark-text">
              {headerTitle}
            </Text>
            <Text className="text-[15px] text-light-secondary dark:text-dark-secondary">
              {headerSubtitle}
            </Text>
          </View>

          <AuthButton label="Sign In" isloading={loading} onPress={handleLogin} disable={false} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
