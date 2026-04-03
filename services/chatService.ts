// Types only — all chat communication goes through the socket (see socketService.ts)

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
