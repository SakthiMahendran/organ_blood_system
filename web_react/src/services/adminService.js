import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const adminService = {
  async getSummary() {
    const response = await apiClient.get(API_MAP.admin.summary);
    return unwrapData(response);
  },

  async getAnalytics() {
    const response = await apiClient.get(API_MAP.admin.analytics);
    return unwrapData(response);
  },

  async getAuditLogs(params) {
    const response = await apiClient.get(API_MAP.admin.audit, { params });
    return unwrapData(response);
  },

  async getUsers() {
    const response = await apiClient.get(API_MAP.admin.users);
    return unwrapData(response);
  },

  async updateUserStatus(userId, isActive) {
    const response = await apiClient.patch(API_MAP.admin.updateUser(userId), {
      is_active: isActive,
    });
    return unwrapData(response);
  },

  async getHospitals() {
    const response = await apiClient.get(API_MAP.admin.hospitals);
    return unwrapData(response);
  },

  async updateHospitalStatus(hospitalId, approvalStatus) {
    const response = await apiClient.patch(API_MAP.admin.updateHospital(hospitalId), {
      approval_status: approvalStatus,
    });
    return unwrapData(response);
  },
};
