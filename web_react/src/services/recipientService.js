import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const recipientService = {
  async getProfile() {
    const response = await apiClient.get(API_MAP.recipients.profile);
    return unwrapData(response);
  },

  async createProfile(payload) {
    const response = await apiClient.post(API_MAP.recipients.profile, payload);
    return unwrapData(response);
  },

  async updateProfile(payload) {
    const response = await apiClient.patch(API_MAP.recipients.updateProfile, payload);
    return unwrapData(response);
  },
};
