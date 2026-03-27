import { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { MotiView } from 'moti';

interface WelcomeGetStartedProps {
  onPress: () => void;
}

export default function WelcomeGetStarted({ onPress }: WelcomeGetStartedProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 18, stiffness: 160, delay: 560 }}
      className="gap-3"
    >
      <Pressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
        <MotiView
          animate={{ scale: pressed ? 0.96 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="h-14 rounded-[16px] bg-white justify-center items-center shadow-md"
        >
          <Text className="text-lg font-bold text-[#6366F1]">Get Started</Text>
        </MotiView>
      </Pressable>
    </MotiView>
  );
}
