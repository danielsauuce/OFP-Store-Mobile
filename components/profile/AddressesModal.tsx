import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Plus, MapPin, Trash2, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getAddressesService,
  addAddressService,
  deleteAddressService,
  setDefaultAddressService,
} from '@/services/userService';

interface Address {
  _id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  note?: string;
  isDefault?: boolean;
}

interface AddressFormState {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  note: string;
}

const EMPTY_FORM: AddressFormState = {
  fullName: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  note: '',
};

interface AddressesModalProps {
  visible: boolean;
  onClose: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View className="gap-1">
      <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
        {label}
        {optional && (
          <Text className="normal-case tracking-normal font-normal" style={{ color: colors.textTertiary }}>
            {' '}
            (optional)
          </Text>
        )}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.textTertiary}
        className="px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          color: colors.text,
        }}
      />
    </View>
  );
}

export default function AddressesModal({ visible, onClose }: AddressesModalProps) {
  const { colors } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getAddressesService();
      const list: Address[] = res?.addresses ?? res?.data ?? res ?? [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAddresses();
      setShowForm(false);
      setForm(EMPTY_FORM);
    }
  }, [visible]);

  const set = (key: keyof AddressFormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    const { fullName, street, city, state, postalCode, country } = form;
    if (!fullName || !street || !city || !state || !postalCode || !country) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await addAddressService({ fullName, street, city, state, postalCode, country, note: form.note });
      await fetchAddresses();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Address', 'Remove this address from your saved addresses?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddressService(id);
            setAddresses((prev) => prev.filter((a) => a._id !== id));
          } catch {
            Alert.alert('Error', 'Could not remove address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);
    try {
      await setDefaultAddressService(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a._id === id })));
    } catch {
      Alert.alert('Error', 'Could not set default address');
    } finally {
      setSettingDefault(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Saved Addresses
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : showForm ? (
          /* Add Address Form */
          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 14 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row items-center gap-2 mb-1">
              <TouchableOpacity
                onPress={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
              >
                <ChevronDown size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text className="text-base font-bold" style={{ color: colors.text }}>
                New Address
              </Text>
            </View>

            <Field
              label="Full Name"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="John Doe"
            />
            <Field label="Street" value={form.street} onChange={set('street')} placeholder="123 Main St" />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="City" value={form.city} onChange={set('city')} placeholder="London" />
              </View>
              <View className="flex-1">
                <Field label="State" value={form.state} onChange={set('state')} placeholder="England" />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={set('postalCode')}
                  placeholder="SW1A 1AA"
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Country"
                  value={form.country}
                  onChange={set('country')}
                  placeholder="United Kingdom"
                />
              </View>
            </View>

            <Field
              label="Delivery Note"
              value={form.note}
              onChange={set('note')}
              placeholder="Leave at door, ring bell, etc."
              optional
            />

            <TouchableOpacity
              className="h-12 rounded-xl items-center justify-center mt-2"
              style={{ backgroundColor: saving ? colors.border : colors.primary }}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Save Address</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          /* Address List */
          <View className="flex-1">
            {addresses.length === 0 ? (
              <View className="flex-1 items-center justify-center gap-3">
                <MapPin size={48} color={colors.border} />
                <Text className="font-semibold text-lg" style={{ color: colors.text }}>
                  No saved addresses
                </Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Add your first delivery address
                </Text>
              </View>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={(a) => a._id}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View
                    className="p-4 rounded-2xl gap-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: item.isDefault ? 1.5 : 0,
                      borderColor: item.isDefault ? colors.primary : 'transparent',
                    }}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 gap-0.5">
                        <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                          {item.fullName}
                        </Text>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          {item.street}
                        </Text>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          {item.city}, {item.state} {item.postalCode}
                        </Text>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          {item.country}
                        </Text>
                        {item.note ? (
                          <Text className="text-xs italic mt-1" style={{ color: colors.textTertiary }}>
                            "{item.note}"
                          </Text>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        className="p-1"
                        onPress={() => handleDelete(item._id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between pt-1">
                      {item.isDefault ? (
                        <View className="flex-row items-center gap-1.5">
                          <CheckCircle2 size={14} color={colors.primary} />
                          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                            Default
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleSetDefault(item._id)}
                          disabled={settingDefault === item._id}
                        >
                          {settingDefault === item._id ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : (
                            <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                              Set as default
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
            )}

            {/* Add button */}
            <View className="px-5 pb-6 pt-2">
              <TouchableOpacity
                className="h-12 rounded-xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
                onPress={() => setShowForm(true)}
              >
                <Plus size={18} color="#fff" />
                <Text className="text-white font-semibold">Add New Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
