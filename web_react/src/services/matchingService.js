import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const matchingService = {
  async runMatching(requestId) {
    const response = await apiClient.post(API_MAP.matching.run, { request_id: requestId });
    return unwrapData(response);
  },
};
