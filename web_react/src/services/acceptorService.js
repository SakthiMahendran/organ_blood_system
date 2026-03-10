import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const acceptorService = {
  async createBloodRequest(payload) {
    const response = await apiClient.post(API_MAP.requests.createBlood, payload);
    return unwrapData(response);
  },

  async createOrganRequest(payload) {
    const response = await apiClient.post(API_MAP.requests.createOrgan, payload);
    return unwrapData(response);
  },

  async getMyRequests() {
    const response = await apiClient.get(API_MAP.requests.myRequests);
    return unwrapData(response);
  },

  async getRequestDetail(requestId) {
    const response = await apiClient.get(API_MAP.requests.detail(requestId));
    return unwrapData(response);
  },

  async updateRequest(requestId, payload) {
    const response = await apiClient.patch(API_MAP.requests.detail(requestId), payload);
    return unwrapData(response);
  },

  async cancelRequest(requestId) {
    const response = await apiClient.patch(API_MAP.requests.detail(requestId), {
      status: 'CANCELLED',
    });
    return unwrapData(response);
  },

  async searchDonors(params) {
    const response = await apiClient.get(API_MAP.search.donors, { params });
    return unwrapData(response);
  },

  async searchDonorCandidates(params) {
    const response = await apiClient.get(API_MAP.matching.candidates, { params });
    return unwrapData(response);
  },
};
