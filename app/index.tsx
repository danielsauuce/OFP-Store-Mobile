import { View, Text, TouchableOpacity, useWindowDimensions, Pressable } from 'react-native';
import '../global.css';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { MotiView } from 'moti';
import { ArrowUpRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const heroImage = require('@/assets/images/welcome-hero.jpg');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { width, height } = useWindowDimensions();
  const [pressed, setPressed] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isLoading && user && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }
  }, [user, isLoading, router]);

  if (user) return null;

  return (
    <View className="flex-1 bg-[#111]">
      {/* Full-bleed hero image — must stay inline: dynamic width/height from useWindowDimensions */}
      <Image source={heroImage} style={{ position: 'absolute', width, height }} contentFit="cover" />

      {/* Dark gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.94)']}
        locations={[0, 0.35, 0.65, 1]}
        style={{ position: 'absolute', width, height }}
      />

      <SafeAreaView className="flex-1">
        {/* Top area — branding badge */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
          className="px-6 pt-2"
        >
          <View
            className="self-start rounded-full px-3.5 py-1.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text
              className="text-xs font-semibold tracking-widest"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              OLAYINKA FURNITURE PALACE
            </Text>
          </View>
        </MotiView>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Bottom content */}
        <View className="px-6 pb-4 gap-5">
          {/* Headline */}
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 550, delay: 200 }}
            className="gap-2.5"
          >
            <Text
              className="text-white font-extrabold"
              style={{ fontSize: 42, lineHeight: 48, letterSpacing: -0.5 }}
            >
              Transform Your Space with Style
            </Text>
            <Text className="text-[15px] leading-6" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Discover premium furniture designed to make your home feel cozy, modern, and uniquely yours.
            </Text>
          </MotiView>

          {/* CTA row */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 160, delay: 420 }}
            className="flex-row items-center gap-3"
          >
            {/* Main button */}
            <Pressable
              onPress={() => router.push('/auth')}
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              className="flex-1"
            >
              <MotiView
                animate={{ scale: pressed ? 0.97 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="h-[54px] rounded-full items-center justify-center bg-[#111]"
              >
                <Text className="text-white text-base font-bold">Start Shopping</Text>
              </MotiView>
            </Pressable>

            {/* Arrow icon button */}
            <TouchableOpacity
              onPress={() => router.push('/auth')}
              className="w-[54px] h-[54px] rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <ArrowUpRight size={22} color="#fff" />
            </TouchableOpacity>
          </MotiView>

          {/* Feature pills */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 600 }}
            className="flex-row gap-4 flex-wrap"
          >
            {['Handcrafted', 'Fast Delivery', 'Lifetime Support'].map((f) => (
              <View key={f} className="flex-row items-center gap-[5px]">
                <View
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                />
                <Text className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {f}
                </Text>
              </View>
            ))}
          </MotiView>
        </View>
      </SafeAreaView>
    </View>
  );
}
