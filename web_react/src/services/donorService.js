import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const donorService = {
  async getProfile() {
    const response = await apiClient.get(API_MAP.donor.profile);
    return unwrapData(response);
  },

  async upsertProfile(payload) {
    const response = await apiClient.put(API_MAP.donor.profile, payload);
    return unwrapData(response);
  },

  async updateAvailability(availabilityStatus) {
    const response = await apiClient.patch(API_MAP.donor.availability, {
      availability_status: availabilityStatus,
    });
    return unwrapData(response);
  },

  async getMatches() {
    const response = await apiClient.get(API_MAP.donor.matches);
    return unwrapData(response);
  },

  async respondToMatch(matchId, responseValue) {
    const response = await apiClient.post(API_MAP.donor.respondToMatch(matchId), {
      response: responseValue,
    });
    return unwrapData(response);
  },
};
