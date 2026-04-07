import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function createChatSocket(): Promise<Socket> {
  const token = await SecureStore.getItemAsync('accessToken');

  if (!token) {
    throw new Error('No access token available — user must be logged in to use chat');
  }

  const socket = io(`${BACKEND_URL}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: false,
    // @ts-ignore socket.io-client supports these but types may not reflect it
    pingInterval: 25000,
    pingTimeout: 20000,
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
    transports: ['websocket', 'polling'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: false,
    // @ts-ignore socket.io-client supports these but types may not reflect it
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  socket.connect();
  return socket;
}
