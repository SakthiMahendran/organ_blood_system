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
    createEmergency: '/requests/emergency',
    myRequests: '/requests/my',
    detail: (requestId) => `/requests/${requestId}`,
  },
  matching: {
    run: '/matching/run',
    candidates: '/matching/candidates',
    results: (matchId) => `/matching/results/${matchId}`,
    respond: (matchId) => `/matching/respond/${matchId}`,
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
    inventory: '/admin/inventory',
    updateInventory: (bloodGroup) => `/admin/inventory/${bloodGroup}`,
  },
  donations: {
    my: '/donations/my',
    detail: (donationId) => `/donations/${donationId}`,
    all: '/donations/all',
    updateStatus: (donationId) => `/donations/${donationId}/status`,
  },
  recipients: {
    profile: '/recipients/profile',
    updateProfile: '/recipients/profile/update',
  },
  ai: {
    chatbotQuestions: '/ai/chatbot/questions',
    chatbotAsk: '/ai/chatbot/ask',
    bloodGroupDetect: '/ai/blood-group/detect',
  },
};
