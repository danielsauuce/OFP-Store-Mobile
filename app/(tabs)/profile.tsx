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
import WishlistModal from '@/components/profile/WishlistModal';
import AddressesModal from '@/components/profile/AddressesModal';
import SupportTicketsModal from '@/components/profile/SupportTicketsModal';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showSupportTickets, setShowSupportTickets] = useState(false);

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

        <ProfileAvatar
          fullName={user.fullName}
          email={user.email}
          profilePicture={user.profilePicture}
          onUploadSuccess={(newUrl) => {
            // Patch the cached user directly so the picture persists without waiting for re-fetch
            queryClient.setQueryData(
              authKeys.me,
              (old: { user: typeof user; accessToken: string } | null) => {
                if (!old) return old;
                return { ...old, user: { ...old.user, profilePicture: newUrl ?? undefined } };
              },
            );
            queryClient.invalidateQueries({ queryKey: authKeys.me });
          }}
        />

        <ProfileMenu
          isDark={isDark}
          toggleTheme={toggleTheme}
          onMyOrders={() => setShowOrders(true)}
          onEditProfile={() => setShowEditProfile(true)}
          onChangePassword={() => setShowChangePassword(true)}
          onWishlist={() => setShowWishlist(true)}
          onAddresses={() => setShowAddresses(true)}
          onSupportTickets={() => setShowSupportTickets(true)}
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

      <WishlistModal visible={showWishlist} onClose={() => setShowWishlist(false)} />

      <AddressesModal visible={showAddresses} onClose={() => setShowAddresses(false)} />

      <SupportTicketsModal visible={showSupportTickets} onClose={() => setShowSupportTickets(false)} />
    </SafeAreaView>
  );
}
