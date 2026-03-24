import { View, Switch } from 'react-native';
import { ShoppingBag, Heart, Moon, LogOut, Trash2, ChevronRight, UserPen, Lock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ProfileMenuItem from './ProfileMenuItem';

interface ProfileMenuProps {
  isDark: boolean;
  toggleTheme: () => void;
  onMyOrders: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  deleting: boolean;
}

export default function ProfileMenu({
  isDark,
  toggleTheme,
  onMyOrders,
  onEditProfile,
  onChangePassword,
  onLogout,
  onDeleteAccount,
  deleting,
}: ProfileMenuProps) {
  const { colors } = useTheme();

  return (
    <View className="px-5 gap-3">
      <ProfileMenuItem
        Icon={UserPen}
        iconColor={colors.primary}
        iconBg={colors.primary + '20'}
        label="Edit Profile"
        onPress={onEditProfile}
        right={<ChevronRight size={18} color={colors.textTertiary} />}
      />

      <ProfileMenuItem
        Icon={Lock}
        iconColor={colors.primary}
        iconBg={colors.primary + '20'}
        label="Change Password"
        onPress={onChangePassword}
        right={<ChevronRight size={18} color={colors.textTertiary} />}
      />

      <ProfileMenuItem
        Icon={ShoppingBag}
        iconColor={colors.primary}
        iconBg={colors.primary + '20'}
        label="My Orders"
        onPress={onMyOrders}
        right={<ChevronRight size={18} color={colors.textTertiary} />}
      />

      <ProfileMenuItem
        Icon={Heart}
        iconColor={colors.error}
        iconBg={colors.error + '20'}
        label="Wishlist"
        right={<ChevronRight size={18} color={colors.textTertiary} />}
      />

      <ProfileMenuItem
        Icon={Moon}
        iconColor={colors.primary}
        iconBg={colors.primary + '20'}
        label="Dark Mode"
        right={
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        }
      />

      <ProfileMenuItem
        Icon={LogOut}
        iconColor={colors.error}
        iconBg={colors.error + '20'}
        label="Logout"
        labelColor={colors.error}
        onPress={onLogout}
      />

      <ProfileMenuItem
        Icon={Trash2}
        iconColor={colors.error}
        iconBg={colors.error + '20'}
        label={deleting ? 'Deleting...' : 'Delete Account'}
        labelColor={colors.error}
        containerBg={colors.error + '15'}
        onPress={onDeleteAccount}
        disabled={deleting}
        isLast
      />
    </View>
  );
}
