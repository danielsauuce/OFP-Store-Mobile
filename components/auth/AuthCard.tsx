import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { AuthForm } from '@/components/forms/AuthForm';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const TITLES: Record<AuthMode, string> = {
  login: 'Welcome Back',
  signup: 'Create Account',
  reset: 'Reset Password',
};

const SUBTITLES: Record<AuthMode, string> = {
  login: 'Sign in to continue',
  signup: 'Get started today',
  reset: 'Enter your new password',
};

interface AuthCardProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  state: AuthState;
  setState: (state: AuthState) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function AuthCard({ mode, setMode, state, setState, onSubmit, loading }: AuthCardProps) {
  return (
    <Card>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">{TITLES[mode]}</Text>
      <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-6">{SUBTITLES[mode]}</Text>
      <AuthForm
        mode={mode}
        setMode={setMode}
        state={state}
        setState={setState}
        onSubmit={onSubmit}
        loading={loading}
      />
    </Card>
  );
}
