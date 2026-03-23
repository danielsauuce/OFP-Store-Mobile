import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Lock, User } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { AuthButton } from '@/components/ui/Button';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  state: AuthState;
  setState: (state: AuthState) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const AuthForm = ({ mode, setMode, state, setState, onSubmit, loading }: Props) => {
  const { name, email, password, confirmPassword } = state;

  return (
    <View className="gap-5">
      {mode === 'signup' && (
        <Input
          label="Full Name"
          placeholder="John Doe"
          icon={<User size={20} color="#9CA3AF" />}
          value={name}
          onChangeText={(v) => setState({ ...state, name: v })}
        />
      )}

      <Input
        label="Email"
        placeholder="you@example.com"
        icon={<Mail size={20} color="#9CA3AF" />}
        value={email}
        onChangeText={(v) => setState({ ...state, email: v })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label={mode === 'reset' ? 'New Password' : 'Password'}
        placeholder="••••••••"
        icon={<Lock size={20} color="#9CA3AF" />}
        secure
        value={password}
        onChangeText={(v) => setState({ ...state, password: v })}
      />

      {mode === 'reset' && (
        <Input
          label="Confirm Password"
          placeholder="••••••••"
          icon={<Lock size={20} color="#9CA3AF" />}
          secure
          value={confirmPassword}
          onChangeText={(v) => setState({ ...state, confirmPassword: v })}
        />
      )}

      {mode === 'login' && (
        <TouchableOpacity onPress={() => setMode('reset')} disabled={loading} className="self-end -mt-2">
          <Text className="text-indigo-500 font-semibold text-sm">Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <AuthButton
        title={mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
        onPress={onSubmit}
        loading={loading}
      />

      <View className="flex-row justify-center items-center gap-2 mt-1">
        {mode === 'reset' ? (
          <TouchableOpacity onPress={() => setMode('login')} disabled={loading}>
            <Text className="text-indigo-500 font-bold">Back to Sign In</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text className="text-gray-500 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </Text>

            <TouchableOpacity
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
            >
              <Text className="text-indigo-500 font-bold text-sm">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
