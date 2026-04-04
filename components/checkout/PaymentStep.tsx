import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Banknote, CreditCard, Building2, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type PaymentMethod = 'pay_on_delivery' | 'bank';

interface Option {
  id: PaymentMethod | 'card';
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
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
      available: true,
    },
    {
      id: 'bank',
      label: 'Bank Transfer',
      description: 'Transfer directly to our account',
      icon: <Building2 size={22} color={colors.primary} />,
      available: true,
    },
    {
      id: 'card',
      label: 'Credit / Debit Card',
      description: 'Coming soon',
      icon: <CreditCard size={22} color={colors.textTertiary} />,
      available: false,
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
              onPress={() => option.available && onSelect(option.id as PaymentMethod)}
              activeOpacity={option.available ? 0.7 : 1}
              className="flex-row items-center p-4 rounded-2xl border"
              style={{
                backgroundColor: isSelected ? colors.primary + '12' : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
                opacity: option.available ? 1 : 0.45,
              }}
            >
              <View
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                {option.icon}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="font-semibold text-sm"
                    style={{ color: option.available ? colors.text : colors.textTertiary }}
                  >
                    {option.label}
                  </Text>
                  {!option.available && (
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.surfaceVariant }}
                    >
                      <Text className="text-[10px] font-semibold" style={{ color: colors.textTertiary }}>
                        Soon
                      </Text>
                    </View>
                  )}
                </View>
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
