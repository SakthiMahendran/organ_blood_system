import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const authService = {
  async register(payload) {
    const response = await apiClient.post(API_MAP.auth.register, payload);
    return unwrapData(response);
  },

  async registerHospital(payload) {
    const response = await apiClient.post(API_MAP.auth.registerHospital, payload);
    return unwrapData(response);
  },

  async login(payload) {
    const response = await apiClient.post(API_MAP.auth.login, payload);
    return unwrapData(response);
  },

  async logout(refreshToken) {
    const response = await apiClient.post(API_MAP.auth.logout, refreshToken ? { refresh: refreshToken } : {});
    return unwrapData(response);
  },

  async me() {
    const response = await apiClient.get(API_MAP.auth.me);
    return unwrapData(response);
  },
};
