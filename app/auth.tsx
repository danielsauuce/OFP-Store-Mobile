import { ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { forgotPasswordService } from '@/services/authService';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthCard from '@/components/auth/AuthCard';

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

  const loading = mode === 'login' ? isLoginPending : isSignupPending;

  const handleAuth = async () => {
    const { name, email, password } = state;

    if (!email || !password || (mode === 'signup' && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (mode === 'reset') {
      try {
        await forgotPasswordService(email);
        Alert.alert('Email Sent', 'A password reset link has been sent to your email.', [
          { text: 'OK', onPress: () => setMode('login') },
        ]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Something went wrong';
        Alert.alert('Error', message);
      }
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
        <AuthHeader />
        <AuthCard
          mode={mode}
          setMode={setMode}
          state={state}
          setState={setState}
          onSubmit={handleAuth}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
