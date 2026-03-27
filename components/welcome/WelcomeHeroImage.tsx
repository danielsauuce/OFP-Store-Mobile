import { View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

const heroImage = require('@/assets/images/welcome-hero.jpg');

export default function WelcomeHeroImage() {
  const { width, height } = useWindowDimensions();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 600, delay: 100 }}
      className="rounded-[32px] overflow-hidden mt-5"
      style={{ width: width - 48, height: height * 0.4 }}
    >
      <Image source={heroImage} style={{ width: '100%', height: '100%' }} contentFit="cover" />

      <MotiView
        from={{ translateY: 0 }}
        animate={{ translateY: -7 }}
        transition={{ loop: true, type: 'timing', duration: 2000, repeatReverse: true }}
        className="absolute top-5 right-5"
      >
        <View
          className="px-4 py-2 rounded-[20px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-xs font-bold text-[#6366F1]" style={{ letterSpacing: 0.5 }}>
            Premium Quality
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );
}
