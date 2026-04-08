import { View } from 'react-native';
import { MotiText, MotiView } from 'moti';

export default function WelcomeBranding() {
  return (
    <View className="items-center gap-2">
      <MotiText
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 200 }}
        className="text-5xl font-bold text-white tracking-wide"
      >
        Olayinka
      </MotiText>

      <MotiText
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 320 }}
        className="text-sm font-semibold text-white/90 tracking-widest uppercase"
      >
        Furniture Palace
      </MotiText>

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 440 }}
      >
        <MotiText className="text-base text-white/85 text-center leading-6 mt-2 px-5">
          Transform your space with our curated collection of timeless furniture pieces
        </MotiText>
      </MotiView>
    </View>
  );
}
