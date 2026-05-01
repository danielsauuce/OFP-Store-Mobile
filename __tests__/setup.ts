import React from 'react';

// ── Stub Expo's winter import.meta registry ──────────────────────────────────
// jest-expo installs a lazy getter for __ExpoImportMetaRegistry that throws
// "outside scope" when accessed. Override it with a plain stub.
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  configurable: true,
  writable: true,
  value: { register: () => {}, importMeta: () => ({}) },
});

// ── Silence console noise in tests ──────────────────────────────────────────
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// ── expo-secure-store mock ───────────────────────────────────────────────────
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'mock-token'),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

// ── expo-router mock ─────────────────────────────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// ── stripe native module mock ───────────────────────────────────────────────
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({
    initPaymentSheet: jest.fn(async () => ({ error: null })),
    presentPaymentSheet: jest.fn(async () => ({ error: null })),
  }),
}));

// ── expo-image mock ─────────────────────────────────────────────────────────
jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return { Image };
});

// ── socket.io-client mock ────────────────────────────────────────────────────
jest.mock('socket.io-client', () => {
  const socket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };
  return { io: jest.fn(() => socket) };
});

// ── react-native-reanimated mock ─────────────────────────────────────────────
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// ── moti mock ────────────────────────────────────────────────────────────────
jest.mock('moti', () => {
  const { View } = require('react-native');
  return {
    MotiView: View,
    MotiText: require('react-native').Text,
    useAnimationState: jest.fn(),
  };
});

// ── lucide-react-native mock ─────────────────────────────────────────────────
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  const icon = () => View;
  return new Proxy({}, { get: () => icon });
});

// ── nativewind mock ───────────────────────────────────────────────────────────
jest.mock('nativewind', () => ({
  styled: (c: unknown) => c,
  useColorScheme: () => ({ colorScheme: 'light' }),
}));
