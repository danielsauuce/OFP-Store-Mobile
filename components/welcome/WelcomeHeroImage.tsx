import { View, Text, Image, useWindowDimensions } from 'react-native';

const heroImage = require('@/assets/images/welcome-hero.jpg');

export default function WelcomeHeroImage() {
  const { width, height } = useWindowDimensions();

  return (
    <View className="rounded-[32px] overflow-hidden mt-5" style={{ width: width - 48, height: height * 0.4 }}>
      <Image source={heroImage} className="w-full h-full" resizeMode="cover" />

      <View className="absolute top-5 right-5">
        <View
          className="px-4 py-2 rounded-[20px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-xs font-bold text-[#6366F1]" style={{ letterSpacing: 0.5 }}>
            Premium Quality
          </Text>
        </View>
      </View>
    </View>
  );
}
