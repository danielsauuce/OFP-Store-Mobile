import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function createChatSocket(): Promise<Socket> {
  const token = await SecureStore.getItemAsync('accessToken');

  const socket = io(`${BACKEND_URL}/chat`, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    autoConnect: false,
  });

  socket.connect();
  return socket;
}
