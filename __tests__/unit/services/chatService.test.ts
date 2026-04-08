import axiosInstance from '@/services/axiosInstance';
import { getConversationsService, getMessagesService } from '@/services/chatService';

jest.mock('@/services/axiosInstance', () => ({
  get: jest.fn(),
}));

const mockGet = axiosInstance.get as jest.Mock;

describe('chatService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── getConversationsService ──────────────────────────────────────────────
  describe('getConversationsService', () => {
    it('returns data on success', async () => {
      const payload = { conversations: [{ _id: 'c1', participants: [] }] };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getConversationsService();
      expect(result).toEqual(payload);
      expect(mockGet).toHaveBeenCalledWith('/api/chat/conversations');
    });

    it('throws on network error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'));
      await expect(getConversationsService()).rejects.toThrow('Network error');
    });

    it('propagates 403 without swallowing the error', async () => {
      const err = Object.assign(new Error('Forbidden'), {
        response: { status: 403, data: { message: 'Access denied, admin only allowed' } },
      });
      mockGet.mockRejectedValueOnce(err);
      await expect(getConversationsService()).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });

  // ── getMessagesService ───────────────────────────────────────────────────
  describe('getMessagesService', () => {
    const convId = 'conv-123';

    it('returns messages on success', async () => {
      const payload = { messages: [{ _id: 'm1', message: 'hello' }] };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getMessagesService(convId);
      expect(result).toEqual(payload);
      expect(mockGet).toHaveBeenCalledWith(`/api/chat/conversations/${convId}/messages`, {
        params: { page: 1, limit: 50 },
      });
    });

    it('uses provided page and limit params', async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await getMessagesService(convId, 3, 25);
      expect(mockGet).toHaveBeenCalledWith(`/api/chat/conversations/${convId}/messages`, {
        params: { page: 3, limit: 25 },
      });
    });

    it('throws on server error', async () => {
      mockGet.mockRejectedValueOnce(
        Object.assign(new Error('Server error'), {
          response: { status: 500, data: { message: 'Internal error' } },
        }),
      );
      await expect(getMessagesService(convId)).rejects.toThrow();
    });
  });
});
