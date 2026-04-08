import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Banknote, CreditCard, Building2, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type PaymentMethod = 'pay_on_delivery' | 'bank' | 'card';

interface Option {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface Props {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentStep({ selected, onSelect }: Props) {
  const { colors } = useTheme();

  const options: Option[] = [
    {
      id: 'pay_on_delivery',
      label: 'Pay on Delivery',
      description: 'Pay in cash when your order arrives',
      icon: <Banknote size={22} color={colors.primary} />,
    },
    {
      id: 'bank',
      label: 'Bank Transfer',
      description: 'Transfer directly to our account',
      icon: <Building2 size={22} color={colors.primary} />,
    },
    {
      id: 'card',
      label: 'Credit / Debit Card',
      description: 'Pay securely with your card via Stripe',
      icon: <CreditCard size={22} color={colors.primary} />,
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-2">
      <Text className="text-base font-bold mb-4" style={{ color: colors.text }}>
        Payment Method
      </Text>

      <View className="gap-3">
        {options.map((option) => {
          const isSelected = selected === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
              className="flex-row items-center p-4 rounded-2xl border"
              style={{
                backgroundColor: isSelected ? colors.primary + '12' : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <View
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                {option.icon}
              </View>

              <View className="flex-1">
                <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                  {option.label}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                  {option.description}
                </Text>
              </View>

              <View
                className="w-5 h-5 rounded-full border-2 items-center justify-center ml-2"
                style={{
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                }}
              >
                {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
