import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const donationService = {
  async getMyDonations() {
    const response = await apiClient.get(API_MAP.donations.my);
    return unwrapData(response);
  },

  async createDonation(payload) {
    const response = await apiClient.post(API_MAP.donations.my, payload);
    return unwrapData(response);
  },

  async getDonationDetail(donationId) {
    const response = await apiClient.get(API_MAP.donations.detail(donationId));
    return unwrapData(response);
  },

  async updateDonation(donationId, payload) {
    const response = await apiClient.patch(API_MAP.donations.detail(donationId), payload);
    return unwrapData(response);
  },

  async deleteDonation(donationId) {
    const response = await apiClient.delete(API_MAP.donations.detail(donationId));
    return unwrapData(response);
  },

  async getAllDonations(params) {
    const response = await apiClient.get(API_MAP.donations.all, { params });
    return unwrapData(response);
  },

  async adminUpdateDonationStatus(donationId, status) {
    const response = await apiClient.patch(API_MAP.donations.updateStatus(donationId), { status });
    return unwrapData(response);
  },
};
