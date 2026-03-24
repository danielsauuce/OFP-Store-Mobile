import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { deactivateAccountService } from '@/services/userService';
import ProfileGuestView from '@/components/profile/ProfileGuestView';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileMenu from '@/components/profile/ProfileMenu';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    return <ProfileGuestView onSignIn={() => router.push('/auth')} />;
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deactivateAccountService();
              await logout();
              router.replace('/');
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Profile
          </Text>
        </View>

        <ProfileAvatar fullName={user.fullName} email={user.email} />

        <ProfileMenu
          isDark={isDark}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          deleting={deleting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
