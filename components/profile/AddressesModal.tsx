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
import { X, Plus, MapPin, Trash2, Pencil, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getAddressesService,
  addAddressService,
  updateAddressService,
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

export const addressKeys = {
  list: ['addresses'] as const,
};

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
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }, [visible]);

  const { data: addresses = [], isLoading: loading } = useQuery<Address[]>({
    queryKey: addressKeys.list,
    queryFn: async () => {
      const res = await getAddressesService();
      const list: Address[] = res?.addresses ?? res?.data ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
    enabled: visible,
    staleTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | null;
      payload: Omit<AddressFormState, 'note'> & { note: string };
    }) => (id ? updateAddressService(id, payload) : addAddressService(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: unknown) => {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save address');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddressService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.list }),
    onError: () => Alert.alert('Error', 'Could not remove address'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => setDefaultAddressService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.list }),
    onError: () => Alert.alert('Error', 'Could not set default address'),
  });

  const set = (key: keyof AddressFormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleEdit = (addr: Address) => {
    setEditingId(addr._id);
    setForm({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      note: addr.note ?? '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const { fullName, street, city, state, postalCode, country } = form;
    if (!fullName || !street || !city || !state || !postalCode || !country) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    saveMutation.mutate({
      id: editingId,
      payload: { fullName, street, city, state, postalCode, country, note: form.note },
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Address', 'Remove this address from your saved addresses?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setSettingDefault(id);
    setDefaultMutation.mutate(id, {
      onSettled: () => setSettingDefault(null),
    });
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
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
              >
                <ChevronDown size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text className="text-base font-bold" style={{ color: colors.text }}>
                {editingId ? 'Edit Address' : 'New Address'}
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
              style={{ backgroundColor: saveMutation.isPending ? colors.border : colors.primary }}
              onPress={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {editingId ? 'Update Address' : 'Save Address'}
                </Text>
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

                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                          className="p-1"
                          onPress={() => handleEdit(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Pencil size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="p-1"
                          onPress={() => handleDelete(item._id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
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
