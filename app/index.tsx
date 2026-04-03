import { View, Text, TouchableOpacity, useWindowDimensions, Pressable } from 'react-native';
import '../global.css';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { MotiView } from 'moti';
import { ArrowUpRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const heroImage = require('@/assets/images/welcome-hero.jpg');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { width, height } = useWindowDimensions();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, router]);

  if (user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      {/* Full-bleed hero image */}
      <Image source={heroImage} style={{ position: 'absolute', width, height }} contentFit="cover" />

      {/* Dark gradient overlay — heavier at bottom where text sits */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.94)']}
        locations={[0, 0.35, 0.65, 1]}
        style={{ position: 'absolute', width, height }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Top area — branding badge */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
          style={{ paddingHorizontal: 24, paddingTop: 8 }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 100,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text
              style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}
            >
              OLAYINKA FURNITURE PALACE
            </Text>
          </View>
        </MotiView>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Bottom content */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 20 }}>
          {/* Headline */}
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 550, delay: 200 }}
            style={{ gap: 10 }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 42,
                fontWeight: '800',
                lineHeight: 48,
                letterSpacing: -0.5,
              }}
            >
              Transform Your Space with Style
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: 15,
                lineHeight: 23,
              }}
            >
              Discover premium furniture designed to make your home feel cozy, modern, and uniquely yours.
            </Text>
          </MotiView>

          {/* CTA row */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 160, delay: 420 }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            {/* Main button */}
            <Pressable
              onPress={() => router.push('/auth')}
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              style={{ flex: 1 }}
            >
              <MotiView
                animate={{ scale: pressed ? 0.97 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                style={{
                  height: 54,
                  backgroundColor: '#111',
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Start Shopping</Text>
              </MotiView>
            </Pressable>

            {/* Arrow icon button */}
            <TouchableOpacity
              onPress={() => router.push('/auth')}
              style={{
                width: 54,
                height: 54,
                borderRadius: 100,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
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
            style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}
          >
            {['Handcrafted', 'Fast Delivery', 'Lifetime Support'].map((f) => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' }}
                />
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' }}>{f}</Text>
              </View>
            ))}
          </MotiView>
        </View>
      </SafeAreaView>
    </View>
  );
}
