import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileGuestViewProps {
  onSignIn: () => void;
}

export default function ProfileGuestView({ onSignIn }: ProfileGuestViewProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center gap-4"
      style={{ backgroundColor: colors.background }}
    >
      <User size={64} color={colors.textTertiary} />
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        Not signed in
      </Text>
      <Text className="text-sm text-center px-10" style={{ color: colors.textSecondary }}>
        Sign in to access your profile, orders, and more
      </Text>
      <TouchableOpacity
        className="px-8 py-3 rounded-2xl"
        style={{ backgroundColor: colors.primary }}
        onPress={onSignIn}
      >
        <Text className="text-white font-semibold">Sign In / Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
