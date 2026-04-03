import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export async function getChatSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync('accessToken');

  socket = io(`${BACKEND_URL}/chat`, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    autoConnect: false,
  });

  socket.connect();
  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}
