import { View, Text } from 'react-native';

export default function WelcomeBranding() {
  return (
    <View className="items-center gap-2">
      <Text className="text-5xl font-bold text-white tracking-wide">Olayinka</Text>
      <Text className="text-sm font-semibold text-white/90 tracking-widest uppercase">Furniture Palace</Text>
      <Text className="text-base text-white/85 text-center leading-6 mt-2 px-5">
        Transform your space with our curated collection of timeless furniture pieces
      </Text>
    </View>
  );
}
