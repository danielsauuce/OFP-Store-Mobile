// Types — all live chat communication goes through the socket (see socketService.ts).
// REST endpoints are used only for conversation history in TicketHistoryModal.
import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export interface ChatParticipant {
  _id: string;
  userId?: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'admin';
}

export interface ChatMessage {
  _id: string;
  tempId?: string;
  conversationId: string;
  sender: ChatParticipant;
  message: string; // matches Mongoose schema field name
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  updatedAt: string;
  createdAt: string;
}

// ── REST helpers for chat history ────────────────────────────────────────────

export async function getConversationsService() {
  try {
    const { data } = await axiosInstance.get('/api/chat/conversations');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getConversations error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getMessagesService(conversationId: string, page: number = 1, limit: number = 50) {
  try {
    const { data } = await axiosInstance.get(`/api/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getMessages error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
