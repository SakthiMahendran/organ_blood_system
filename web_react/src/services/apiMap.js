export const API_MAP = {
  auth: {
    register: '/auth/register',
    registerHospital: '/auth/register/hospital',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/token/refresh',
  },
  donor: {
    profile: '/donors/profile',
    availability: '/donors/availability',
    matches: '/donors/matches',
    respondToMatch: (matchId) => `/donors/matches/${matchId}/respond`,
  },
  requests: {
    createBlood: '/requests/blood',
    createOrgan: '/requests/organ',
    myRequests: '/requests/my',
    detail: (requestId) => `/requests/${requestId}`,
  },
  matching: {
    run: '/matching/run',
    candidates: '/matching/candidates',
  },
  search: {
    donors: '/search/donors',
  },
  hospital: {
    requests: '/hospital/requests',
    pendingVerifications: '/hospital/verifications/pending',
    updateVerification: (donorId) => `/hospital/verifications/${donorId}`,
    updateRequestStatus: (requestId) => `/hospital/requests/${requestId}/status`,
  },
  notifications: {
    list: '/notifications/',
    markRead: (notificationId) => `/notifications/${notificationId}/read`,
  },
  admin: {
    summary: '/admin/reports/summary',
    analytics: '/admin/reports/analytics',
    audit: '/admin/audit',
    users: '/admin/users',
    updateUser: (userId) => `/admin/users/${userId}`,
    hospitals: '/admin/hospitals',
    updateHospital: (hospitalId) => `/admin/hospitals/${hospitalId}`,
  },
  ai: {
    chatbotQuestions: '/ai/chatbot/questions',
    chatbotAsk: '/ai/chatbot/ask',
    bloodGroupDetect: '/ai/blood-group/detect',
  },
};
