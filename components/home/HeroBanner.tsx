import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroBannerProps {
  onShopPress: () => void;
}

export default function HeroBanner({ onShopPress }: HeroBannerProps) {
  const { colors } = useTheme();

  return (
    <View className="mx-5 mt-4 rounded-3xl overflow-hidden h-48">
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60',
        }}
        className="w-full h-full"
      />
      <View className="absolute inset-0 justify-end p-5" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <Text className="text-white text-xl font-bold">New Collection</Text>
        <Text className="text-white/80 text-sm mb-3">Timeless furniture for every space</Text>
        <TouchableOpacity
          className="self-start px-5 py-2 rounded-full"
          style={{ backgroundColor: colors.primary }}
          onPress={onShopPress}
        >
          <Text className="text-white font-semibold text-sm">Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
