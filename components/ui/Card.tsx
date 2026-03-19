import { View } from 'react-native';

export const Card = ({ children }: { children: React.ReactNode }): any => {
  return <View className="bg-white rounded-2xl p-7 shadow-md">{children}</View>;
};
