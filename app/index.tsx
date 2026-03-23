import { Text, View, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import '../global.css';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <View className="flex-1 bg-indigo-500" />;
  }

  if (user) return null;

  const handleGetStarted = () => {
    router.push('/auth');
  };

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
          <View
            className="rounded-[32px] overflow-hidden mt-5"
            style={{ width: width - 48, height: height * 0.4 }}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZ1cm5pdHVyZXxlbnwwfHwwfHx8MA%3D%3D',
              }}
              className="w-full h-full"
            />

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

          <View className="items-center gap-2">
            <Text className="text-5xl font-bold text-white tracking-wide">Olayinka</Text>
            <Text className="text-sm font-semibold text-white/90 tracking-widest uppercase">
              Furniture Palace
            </Text>
            <Text className="text-base text-white/85 text-center leading-6 mt-2 px-5">
              Transform your space with our curated collection of timeless furniture pieces
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              className="h-14 rounded-[16px] bg-white justify-center items-center shadow-md"
              onPress={handleGetStarted}
            >
              <Text className="text-lg font-bold text-[#6366F1]">Get Started</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-center gap-5">
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <Text className="text-[14px] font-semibold text-white/90">Handcrafted Excellence</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <Text className="text-[14px] font-semibold text-white/90">Fast Delivery</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <Text className="text-[14px] font-semibold text-white/90">Lifetime Support</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
