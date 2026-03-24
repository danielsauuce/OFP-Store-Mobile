import { View, StyleSheet } from 'react-native';
import '../global.css';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeHeroImage from '@/components/welcome/WelcomeHeroImage';
import WelcomeBranding from '@/components/welcome/WelcomeBranding';
import WelcomeGetStarted from '@/components/welcome/WelcomeGetStarted';
import WelcomeFeatures from '@/components/welcome/WelcomeFeatures';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <View className="flex-1 bg-indigo-500" />;
  }

  if (user) return null;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#8B5CF6', '#6366F1', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ ...StyleSheet.absoluteFillObject }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-5 pb-8 justify-between">
          <WelcomeHeroImage />
          <WelcomeBranding />
          <WelcomeGetStarted onPress={() => router.push('/auth')} />
          <WelcomeFeatures />
        </View>
      </SafeAreaView>
    </View>
  );
}
