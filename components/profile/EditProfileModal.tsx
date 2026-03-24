import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { updateUserProfileService } from '@/services/userService';

interface EditProfileModalProps {
  visible: boolean;
  fullName: string;
  email: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditProfileModal({
  visible,
  fullName,
  email,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(fullName);
  const [emailVal, setEmailVal] = useState(email);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !emailVal.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfileService({ fullName: name.trim(), email: emailVal.trim() });
      onSaved();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not update profile';
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
            Edit Profile
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ gap: 16 }}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={emailVal}
            onChangeText={setEmailVal}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
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
              <Text className="text-white font-bold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
