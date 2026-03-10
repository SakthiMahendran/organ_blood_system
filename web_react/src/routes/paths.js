export const PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_HOSPITAL: '/register/hospital',
  UNAUTHORIZED: '/unauthorized',

  DONOR_DASHBOARD: '/donor/dashboard',
  DONOR_PROFILE: '/donor/profile',
  DONOR_MATCHES: '/donor/matches',
  DONOR_NOTIFICATIONS: '/donor/notifications',
  DONOR_AI_ASSISTANT: '/donor/ai-assistant',

  ACCEPTOR_DASHBOARD: '/acceptor/dashboard',
  ACCEPTOR_CREATE_REQUEST: '/acceptor/create-request',
  ACCEPTOR_TRACK_REQUESTS: '/acceptor/track-requests',
  ACCEPTOR_SEARCH_DONORS: '/acceptor/search-donors',
  ACCEPTOR_NOTIFICATIONS: '/acceptor/notifications',
  ACCEPTOR_AI_ASSISTANT: '/acceptor/ai-assistant',

  HOSPITAL_DASHBOARD: '/hospital/dashboard',
  HOSPITAL_VERIFY_DONORS: '/hospital/verify-donors',
  HOSPITAL_REQUESTS: '/hospital/requests',
  HOSPITAL_AI_ASSISTANT: '/hospital/ai-assistant',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_HOSPITALS: '/admin/hospitals',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_AI_ASSISTANT: '/admin/ai-assistant',
};

export const ROLE_HOME = {
  DONOR: PATHS.DONOR_DASHBOARD,
  ACCEPTOR: PATHS.ACCEPTOR_DASHBOARD,
  HOSPITAL: PATHS.HOSPITAL_DASHBOARD,
  ADMIN: PATHS.ADMIN_DASHBOARD,
};
