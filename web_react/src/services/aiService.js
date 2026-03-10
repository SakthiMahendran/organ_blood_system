import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const aiService = {
  async getChatbotQuestions() {
    const response = await apiClient.get(API_MAP.ai.chatbotQuestions);
    return unwrapData(response);
  },

  async askChatbot(message) {
    const response = await apiClient.post(API_MAP.ai.chatbotAsk, { message });
    return unwrapData(response);
  },

  async detectBloodGroup({ source, imageFile } = {}) {
    if (imageFile) {
      const formData = new FormData();
      formData.append('source', source || imageFile.name || 'uploaded-image');
      formData.append('image', imageFile);

      const response = await apiClient.post(API_MAP.ai.bloodGroupDetect, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrapData(response);
    }

    const response = await apiClient.post(API_MAP.ai.bloodGroupDetect, {
      source: source || 'sample',
    });
    return unwrapData(response);
  },
};
