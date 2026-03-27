import { View, Text } from 'react-native';
import { MotiView } from 'moti';

const FEATURES = ['Handcrafted Excellence', 'Fast Delivery', 'Lifetime Support'];

export default function WelcomeFeatures() {
  return (
    <View className="flex-row flex-wrap justify-center gap-5">
      {FEATURES.map((label, index) => (
        <MotiView
          key={label}
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 180, delay: 680 + index * 100 }}
          className="flex-row items-center gap-1.5"
        >
          <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <Text className="text-[14px] font-semibold text-white/90">{label}</Text>
        </MotiView>
      ))}
    </View>
  );
}
