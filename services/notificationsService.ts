import axiosInstance from './axiosInstance';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'review' | 'system' | 'chat';
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

export const getNotificationsService = async (page = 1, limit = 20): Promise<NotificationsResponse> => {
  const { data } = await axiosInstance.get('/api/notifications', { params: { page, limit } });
  return data;
};

export const getUnreadCountService = async (): Promise<{ unreadCount: number }> => {
  const { data } = await axiosInstance.get('/api/notifications/unread-count');
  return data;
};

export const markAsReadService = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/api/notifications/${id}/read`);
};

export const markAllAsReadService = async (): Promise<void> => {
  await axiosInstance.patch('/api/notifications/read-all');
};
