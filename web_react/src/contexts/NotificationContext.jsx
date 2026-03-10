import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return [];
    }

    setIsLoading(true);
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(list) ? list : []);
      return list;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((item) => !item.is_read);
    await Promise.all(unread.map((item) => notificationService.markAsRead(item.id)));
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
  }, [notifications]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
      const intervalId = window.setInterval(refreshNotifications, 30000);
      return () => window.clearInterval(intervalId);
    }

    setNotifications([]);
    return undefined;
  }, [isAuthenticated, refreshNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, isLoading, refreshNotifications, markAsRead, markAllAsRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return context;
};
