import * as SecureStore from 'expo-secure-store';
import { io } from 'socket.io-client';
import { createChatSocket, createNotificationsSocket } from '@/services/socketService';

const mockIo = io as jest.Mock;

describe('socketService', () => {
  const fakeSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.mockReturnValue(fakeSocket);
  });

  // ── createChatSocket ─────────────────────────────────────────────────────
  describe('createChatSocket', () => {
    it('connects to the /chat namespace', async () => {
      await createChatSocket();
      expect(mockIo).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({ transports: ['polling', 'websocket'] }),
      );
    });

    it('passes stored token as auth', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('access-token-xyz');
      await createChatSocket();
      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ auth: { token: 'access-token-xyz' } }),
      );
    });

    it('throws when token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      await expect(createChatSocket()).rejects.toThrow('No access token available');
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('calls socket.connect()', async () => {
      await createChatSocket();
      expect(fakeSocket.connect).toHaveBeenCalled();
    });

    it('returns the socket instance', async () => {
      const socket = await createChatSocket();
      expect(socket).toBe(fakeSocket);
    });
  });

  // ── createNotificationsSocket ────────────────────────────────────────────
  describe('createNotificationsSocket', () => {
    it('connects to the /notifications namespace', async () => {
      await createNotificationsSocket();
      expect(mockIo).toHaveBeenCalledWith(expect.stringContaining('/notifications'), expect.any(Object));
    });

    it('passes stored token as auth', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('token-abc');
      await createNotificationsSocket();
      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ auth: { token: 'token-abc' } }),
      );
    });

    it('calls socket.connect()', async () => {
      await createNotificationsSocket();
      expect(fakeSocket.connect).toHaveBeenCalled();
    });

    it('returns the socket instance', async () => {
      const socket = await createNotificationsSocket();
      expect(socket).toBe(fakeSocket);
    });
  });
});
