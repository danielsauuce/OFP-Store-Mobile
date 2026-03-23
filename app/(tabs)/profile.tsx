import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, ShoppingBag, Heart, Moon, LogOut, Trash2, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { deactivateAccountService } from '@/services/userService';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
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

  if (!user) {
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
          onPress={() => router.push('/auth')}
        >
          <Text className="text-white font-semibold">Sign In / Sign Up</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Profile
          </Text>
        </View>

        {/* Avatar & info */}
        <View className="items-center py-6 gap-2">
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-3xl font-bold text-white">{initials}</Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            {user.fullName}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {user.email}
          </Text>
        </View>

        {/* Menu items */}
        <View className="px-5 gap-3">
          {/* My Orders */}
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
            onPress={() => Alert.alert('Orders', 'Orders screen coming soon')}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <ShoppingBag size={20} color={colors.primary} />
            </View>
            <Text className="flex-1 font-semibold" style={{ color: colors.text }}>
              My Orders
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Wishlist */}
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
            onPress={() => Alert.alert('Wishlist', 'Wishlist coming soon')}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.error + '20' }}
            >
              <Heart size={20} color={colors.error} />
            </View>
            <Text className="flex-1 font-semibold" style={{ color: colors.text }}>
              Wishlist
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Dark mode toggle */}
          <View className="flex-row items-center p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Moon size={20} color={colors.primary} />
            </View>
            <Text className="flex-1 font-semibold" style={{ color: colors.text }}>
              Dark Mode
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>

          {/* Logout */}
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
            onPress={handleLogout}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.error + '20' }}
            >
              <LogOut size={20} color={colors.error} />
            </View>
            <Text className="flex-1 font-semibold" style={{ color: colors.error }}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* Delete account */}
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-2xl mb-6"
            style={{ backgroundColor: colors.error + '15' }}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.error + '20' }}
            >
              <Trash2 size={20} color={colors.error} />
            </View>
            <Text className="flex-1 font-semibold" style={{ color: colors.error }}>
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
