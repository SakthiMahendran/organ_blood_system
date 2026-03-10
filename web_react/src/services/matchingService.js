import apiClient from './apiClient';
import { API_MAP } from './apiMap';
import { unwrapData } from './apiResponse';

export const matchingService = {
  async runMatching(requestId) {
    const response = await apiClient.post(API_MAP.matching.run, { request_id: requestId });
    return unwrapData(response);
  },

  async getCandidates(params) {
    const response = await apiClient.get(API_MAP.matching.candidates, { params });
    return unwrapData(response);
  },

  async getMatchResults(matchId) {
    const response = await apiClient.get(API_MAP.matching.results(matchId));
    return unwrapData(response);
  },

  async respondToMatch(matchId, responseValue) {
    const response = await apiClient.post(API_MAP.matching.respond(matchId), {
      response: responseValue,
    });
    return unwrapData(response);
  },
};
