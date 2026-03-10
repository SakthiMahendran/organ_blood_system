import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const bloodUnitService = {
  async getBloodUnits(params = {}) {
    const response = await apiClient.get(API_MAP.donations.bloodUnits, { params });
    return unwrapData(response);
  },

  async createBloodUnit(data) {
    const response = await apiClient.post(API_MAP.donations.bloodUnits, data);
    return unwrapData(response);
  },

  async getExpiryAlerts() {
    const response = await apiClient.get(API_MAP.donations.expiryAlerts);
    return unwrapData(response);
  },

  async getFifoSuggestion(bloodGroup, units = 1) {
    const response = await apiClient.get(API_MAP.donations.fifoSuggestion, {
      params: { blood_group: bloodGroup, units },
    });
    return unwrapData(response);
  },

  async getWastageStats() {
    const response = await apiClient.get(API_MAP.donations.wastageStats);
    return unwrapData(response);
  },

  async getRedistributionSuggestions(params = {}) {
    const response = await apiClient.get(API_MAP.donations.redistributionSuggestions, { params });
    return unwrapData(response);
  },

  async generateRedistribution() {
    const response = await apiClient.post(API_MAP.donations.redistributionGenerate);
    return unwrapData(response);
  },

  async updateRedistribution(id, status) {
    const response = await apiClient.patch(API_MAP.donations.redistributionUpdate(id), { status });
    return unwrapData(response);
  },
};
