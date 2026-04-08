import { View, Text, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  note: string;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  flex?: boolean;
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
  const { colors } = useTheme();
  return (
    <View className="mb-4">
      <Text
        className="text-xs font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        className="px-4 py-[13px] rounded-xl text-[15px]"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
          borderWidth: 1,
        }}
      />
    </View>
  );
}

interface Props {
  address: ShippingAddress;
  onChange: (field: keyof ShippingAddress, value: string) => void;
}

export default function AddressStep({ address, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-2">
      <Text className="text-base font-bold mb-4" style={{ color: colors.text }}>
        Delivery Address
      </Text>

      <Field
        label="Full Name"
        value={address.fullName}
        onChange={(v) => onChange('fullName', v)}
        placeholder="e.g. John Doe"
      />

      <Field
        label="Email Address"
        value={address.email}
        onChange={(v) => onChange('email', v)}
        placeholder="e.g. john@example.com"
      />

      <Field
        label="Phone Number"
        value={address.phone}
        onChange={(v) => onChange('phone', v)}
        placeholder="e.g. +44 7700 900000"
      />

      <Field
        label="Street Address"
        value={address.street}
        onChange={(v) => onChange('street', v)}
        placeholder="e.g. 12 Oak Lane, Flat 3"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field
            label="City"
            value={address.city}
            onChange={(v) => onChange('city', v)}
            placeholder="London"
          />
        </View>
        <View className="flex-1">
          <Field
            label="County / State"
            value={address.state}
            onChange={(v) => onChange('state', v)}
            placeholder="Greater London"
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field
            label="Postcode"
            value={address.postalCode}
            onChange={(v) => onChange('postalCode', v)}
            placeholder="EC1A 1BB"
          />
        </View>
        <View className="flex-1">
          <Field
            label="Country"
            value={address.country}
            onChange={(v) => onChange('country', v)}
            placeholder="United Kingdom"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text
          className="text-xs font-semibold mb-1.5 uppercase tracking-wide"
          style={{ color: colors.textSecondary }}
        >
          Delivery Note (optional)
        </Text>
        <TextInput
          value={address.note}
          onChangeText={(v) => onChange('note', v)}
          placeholder="e.g. Leave with neighbour if not in"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
          className="px-4 py-[13px] rounded-xl text-[15px] min-h-20"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
            borderWidth: 1,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
