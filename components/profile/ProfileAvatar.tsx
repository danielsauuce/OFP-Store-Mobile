import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { uploadProfilePictureService } from '@/services/userService';

interface ProfileAvatarProps {
  fullName: string;
  email: string;
  profilePicture?: string;
  onUploadSuccess?: () => void;
}

export default function ProfileAvatar({
  fullName,
  email,
  profilePicture,
  onUploadSuccess,
}: ProfileAvatarProps) {
  const { colors } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const imageUri = localImage ?? profilePicture;

  const launchPicker = async (source: 'camera' | 'library') => {
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = uri.split('/').pop() ?? 'photo.jpg';
    const rawType = asset.mimeType ?? 'image/jpeg';
    const type = rawType === 'image/jpg' ? 'image/jpeg' : rawType;

    setLocalImage(uri);
    setUploading(true);
    try {
      await uploadProfilePictureService({ uri, name: filename, type });
      onUploadSuccess?.();
    } catch {
      Alert.alert('Error', 'Could not upload photo. Please try again.');
      setLocalImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handlePress = () => {
    Alert.alert('Profile Photo', 'Choose a source', [
      { text: 'Camera', onPress: () => launchPicker('camera') },
      { text: 'Photo Library', onPress: () => launchPicker('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View className="items-center py-6 gap-2">
      <TouchableOpacity onPress={handlePress} disabled={uploading} activeOpacity={0.8}>
        <View style={{ position: 'relative' }}>
          <View
            className="w-24 h-24 rounded-full overflow-hidden items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 96, height: 96 }} contentFit="cover" />
            ) : (
              <Text className="text-3xl font-bold text-white">{initials}</Text>
            )}
          </View>

          <View
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background }}
          >
            {uploading ? <ActivityIndicator size={12} color="#fff" /> : <Camera size={14} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>

      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        {fullName}
      </Text>
      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        {email}
      </Text>
    </View>
  );
}
