import axiosInstance from './axiosInstance';

export interface ChatParticipant {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'admin';
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: ChatParticipant;
  content: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  updatedAt: string;
  createdAt: string;
}

export const getConversationsService = async (): Promise<{ conversations: Conversation[] }> => {
  const { data } = await axiosInstance.get('/api/chat/conversations');
  return data;
};

export const getMessagesService = async (
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<{ messages: ChatMessage[]; total: number; page: number }> => {
  if (!conversationId) throw new TypeError('conversationId is required');

  const encodedId = encodeURIComponent(conversationId);
  const { data } = await axiosInstance.get(`/api/chat/conversations/${encodedId}/messages`, {
    params: { page, limit },
  });

  return data;
};

export const createConversationService = async (): Promise<{ conversation: Conversation }> => {
  const { data } = await axiosInstance.post('/api/chat/conversations');
  return data;
};

export const sendChatMessageService = async (
  conversationId: string,
  content: string,
): Promise<{ message: ChatMessage }> => {
  const encodedId = encodeURIComponent(conversationId);
  const { data } = await axiosInstance.post(`/api/chat/conversations/${encodedId}/messages`, {
    content,
  });
  return data;
};
