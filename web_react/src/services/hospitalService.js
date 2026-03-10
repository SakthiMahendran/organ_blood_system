import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const hospitalService = {
  async getHospitalRequests() {
    const response = await apiClient.get(API_MAP.hospital.requests);
    return unwrapData(response);
  },

  async getPendingVerifications() {
    const response = await apiClient.get(API_MAP.hospital.pendingVerifications);
    return unwrapData(response);
  },

  async updateVerification(donorId, verificationStatus) {
    const response = await apiClient.patch(API_MAP.hospital.updateVerification(donorId), {
      verification_status: verificationStatus,
    });
    return unwrapData(response);
  },

  async updateRequestStatus(requestId, status, notes) {
    const response = await apiClient.patch(API_MAP.hospital.updateRequestStatus(requestId), {
      status,
      notes,
    });
    return unwrapData(response);
  },
};
