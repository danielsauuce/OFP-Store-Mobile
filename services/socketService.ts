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
    transports: ['websocket', 'polling'],
    autoConnect: false,
  });

  socket.connect();
  return socket;
}
