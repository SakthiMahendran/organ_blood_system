import axios from 'axios';

import { API_MAP } from './apiMap';
import { clearAuthStorage, getAccessToken, getRefreshToken, setTokens } from '../utils/authStorage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const notifySubscribers = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const triggerLogout = () => {
  clearAuthStorage();
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

const getRefreshedAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const refreshResponse = await axios.post(`${API_BASE_URL}${API_MAP.auth.refresh}`, {
    refresh: refreshToken,
  });

  const accessToken =
    refreshResponse?.data?.access ||
    refreshResponse?.data?.data?.access ||
    refreshResponse?.data?.tokens?.access;

  const returnedRefresh =
    refreshResponse?.data?.refresh ||
    refreshResponse?.data?.data?.refresh ||
    refreshResponse?.data?.tokens?.refresh ||
    refreshToken;

  if (!accessToken) {
    throw new Error('Refresh token response did not include access token');
  }

  setTokens({ accessToken, refreshToken: returnedRefresh });
  window.dispatchEvent(
    new CustomEvent('auth:tokens-updated', {
      detail: { accessToken, refreshToken: returnedRefresh },
    }),
  );

  return accessToken;
};

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const unauthorized = error?.response?.status === 401;

    if (!unauthorized || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      triggerLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newAccessToken) => {
          if (!newAccessToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const newAccessToken = await getRefreshedAccessToken();
      notifySubscribers(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      notifySubscribers(null);
      triggerLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
