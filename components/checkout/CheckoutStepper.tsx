import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const STEPS = ['Address', 'Payment', 'Review'];

export default function CheckoutStepper({ currentStep }: { currentStep: number }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-start px-6 py-4">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < currentStep;
        const active = step === currentStep;

        return (
          <View key={label} className="flex-row items-center flex-1">
            <View className="items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: done || active ? colors.primary : colors.surfaceVariant }}
              >
                {done ? (
                  <Check size={14} color="#fff" strokeWidth={3} />
                ) : (
                  <Text
                    className="text-xs font-bold"
                    style={{ color: active ? '#fff' : colors.textTertiary }}
                  >
                    {step}
                  </Text>
                )}
              </View>
              <Text
                className="text-[10px] font-semibold mt-1"
                style={{ color: active || done ? colors.primary : colors.textTertiary }}
              >
                {label}
              </Text>
            </View>

            {index < STEPS.length - 1 && (
              <View
                className="flex-1 h-0.5 mb-4 mx-1"
                style={{ backgroundColor: done ? colors.primary : colors.border }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
