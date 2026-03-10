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
};
