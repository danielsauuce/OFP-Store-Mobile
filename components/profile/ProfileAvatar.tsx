import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileAvatarProps {
  fullName: string;
  email: string;
}

export default function ProfileAvatar({ fullName, email }: ProfileAvatarProps) {
  const { colors } = useTheme();

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className="items-center py-6 gap-2">
      <View
        className="w-24 h-24 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-3xl font-bold text-white">{initials}</Text>
      </View>
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        {fullName}
      </Text>
      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        {email}
      </Text>
    </View>
  );
}
