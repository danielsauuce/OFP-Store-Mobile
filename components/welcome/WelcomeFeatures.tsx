import { View, Text } from 'react-native';

const FEATURES = ['Handcrafted Excellence', 'Fast Delivery', 'Lifetime Support'];

export default function WelcomeFeatures() {
  return (
    <View className="flex-row flex-wrap justify-center gap-5">
      {FEATURES.map((label) => (
        <View key={label} className="flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <Text className="text-[14px] font-semibold text-white/90">{label}</Text>
        </View>
      ))}
    </View>
  );
}
