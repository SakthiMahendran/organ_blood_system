import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const notificationService = {
  async getMyNotifications() {
    const response = await apiClient.get(API_MAP.notifications.list);
    return unwrapData(response);
  },

  async markAsRead(notificationId) {
    const response = await apiClient.patch(API_MAP.notifications.markRead(notificationId));
    return unwrapData(response);
  },
};
