import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

function resolveSocketBaseUrl(): string {
  const explicitSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (explicitSocketUrl) return explicitSocketUrl.replace(/\/$/, '');

  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
  return apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

const BACKEND_URL = resolveSocketBaseUrl();

export async function createChatSocket(): Promise<Socket> {
  const token = await SecureStore.getItemAsync('accessToken');

  if (!token) {
    throw new Error('No access token available — user must be logged in to use chat');
  }

  const socket = io(`${BACKEND_URL}/chat`, {
    auth: { token },
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
  });

  socket.connect();
  return socket;
}

export async function createNotificationsSocket(): Promise<Socket> {
  const token = await SecureStore.getItemAsync('accessToken');

  if (!token) {
    throw new Error('No access token available — user must be logged in for notifications');
  }

  const socket = io(`${BACKEND_URL}/notifications`, {
    auth: { token },
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
  });

  socket.connect();
  return socket;
}
