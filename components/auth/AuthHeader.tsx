import { View, Text } from 'react-native';

export default function AuthHeader() {
  return (
    <View className="items-center mb-10">
      <Text className="text-4xl font-bold text-light-primary dark:text-dark-primary">Olayinka</Text>
      <Text className="text-xs uppercase tracking-widest text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
        Furniture Palace
      </Text>
    </View>
  );
}
