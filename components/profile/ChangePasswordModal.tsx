import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { changePasswordService } from '@/services/authService';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePasswordService({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully');
      reset();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not change password';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Change Password
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ gap: 16 }}>
          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            secure
          />
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secure
          />
          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secure
          />
        </ScrollView>

        <View className="px-5 pb-8 pt-4">
          <TouchableOpacity
            className="h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: saving ? colors.border : colors.primary }}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
