import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { AuthForm } from '@/components/forms/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, signup, isLoginPending, isSignupPending } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [state, setState] = useState<AuthState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Derive loading from the active mutation
  const loading = mode === 'login' ? isLoginPending : isSignupPending;

  const handleAuth = async () => {
    const { name, email, password, confirmPassword } = state;

    if (!email || !password || (mode === 'signup' && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (mode === 'reset') {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      Alert.alert('Info', 'A reset link will be sent to your email.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      Alert.alert('Error', message);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-indigo-500">Olayinka</Text>
          <Text className="text-xs uppercase tracking-widest text-gray-400 mt-1">Furniture Palace</Text>
        </View>

        {/* Form */}
        <Card>
          <Text className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </Text>

          <Text className="text-gray-400 mb-6">
            {mode === 'login'
              ? 'Sign in to continue'
              : mode === 'signup'
                ? 'Get started today'
                : 'Enter your new password'}
          </Text>

          <AuthForm
            mode={mode}
            setMode={setMode}
            state={state}
            setState={setState}
            onSubmit={handleAuth}
            loading={loading}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
