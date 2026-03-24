import { View, Text } from 'react-native';

export default function AuthHeader() {
  return (
    <View className="items-center mb-10">
      <Text className="text-4xl font-bold text-indigo-500">Olayinka</Text>
      <Text className="text-xs uppercase tracking-widest text-gray-400 mt-1">Furniture Palace</Text>
    </View>
  );
}
