import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const sosService = {
  async broadcastSOS(requestId) {
    const response = await apiClient.post(API_MAP.requests.sosBroadcast(requestId));
    return unwrapData(response);
  },

  async respondToSOS(requestId, responseValue) {
    const response = await apiClient.post(API_MAP.requests.sosRespond(requestId), {
      response: responseValue,
    });
    return unwrapData(response);
  },

  async getSOSTracker(requestId) {
    const response = await apiClient.get(API_MAP.requests.sosTracker(requestId));
    return unwrapData(response);
  },
};
