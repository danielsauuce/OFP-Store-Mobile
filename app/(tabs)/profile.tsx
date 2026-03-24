import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth, authKeys } from '@/contexts/AuthContext';
import { deactivateAccountService } from '@/services/userService';
import ProfileGuestView from '@/components/profile/ProfileGuestView';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileMenu from '@/components/profile/ProfileMenu';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import OrdersModal from '@/components/profile/OrdersModal';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

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
          onMyOrders={() => setShowOrders(true)}
          onEditProfile={() => setShowEditProfile(true)}
          onChangePassword={() => setShowChangePassword(true)}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          deleting={deleting}
        />
      </ScrollView>

      <EditProfileModal
        visible={showEditProfile}
        fullName={user.fullName}
        email={user.email}
        onClose={() => setShowEditProfile(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: authKeys.me })}
      />

      <ChangePasswordModal visible={showChangePassword} onClose={() => setShowChangePassword(false)} />

      <OrdersModal visible={showOrders} onClose={() => setShowOrders(false)} />
    </SafeAreaView>
  );
}
