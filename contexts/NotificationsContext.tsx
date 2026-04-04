import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createNotificationsSocket } from '@/services/socketService';

interface NotificationsContextType {
  unreadCount: number;
  incrementUnread: () => void;
  resetUnread: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  unreadCount: 0,
  incrementUnread: () => {},
  resetUnread: () => {},
});

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    createNotificationsSocket().then((socket) => {
      socketRef.current = socket;

      socket.on('notification:new', () => {
        setUnreadCount((n) => n + 1);
        // Invalidate so the notifications list and unread count REST calls refresh
        qc.invalidateQueries({ queryKey: ['notifications'] });
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user, qc]);

  const incrementUnread = () => setUnreadCount((n) => n + 1);
  const resetUnread = () => setUnreadCount(0);

  return (
    <NotificationsContext.Provider value={{ unreadCount, incrementUnread, resetUnread }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
