import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface CartHeaderProps {
  showClearAll: boolean;
  onClearAll: () => void;
}

export default function CartHeader({ showClearAll, onClearAll }: CartHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={20} color={colors.text} />
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Basket</Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {showClearAll && (
          <TouchableOpacity onPress={onClearAll}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.error }}>Clear</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => router.push('/(tabs)/shop')}
        >
          <Heart size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
