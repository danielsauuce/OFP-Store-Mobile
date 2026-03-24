import { View, Text, TouchableOpacity } from 'react-native';

interface WelcomeGetStartedProps {
  onPress: () => void;
}

export default function WelcomeGetStarted({ onPress }: WelcomeGetStartedProps) {
  return (
    <View className="gap-3">
      <TouchableOpacity
        className="h-14 rounded-[16px] bg-white justify-center items-center shadow-md"
        onPress={onPress}
      >
        <Text className="text-lg font-bold text-[#6366F1]">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
