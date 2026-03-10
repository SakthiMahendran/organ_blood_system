class Endpoints {
  const Endpoints._();

  // Auth
  static const String register = '/auth/register';
  static const String registerHospital = '/auth/register/hospital';
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String refresh = '/auth/token/refresh';

  // Donor
  static const String donorProfile = '/donors/profile';
  static const String donorAvailability = '/donors/availability';
  static const String donorMatches = '/donors/matches';
  static String donorMatchRespond(int matchId) =>
      '/donors/matches/$matchId/respond';

  // Requests
  static const String createBloodRequest = '/requests/blood';
  static const String createOrganRequest = '/requests/organ';
  static const String myRequests = '/requests/my';
  static String requestDetail(int requestId) => '/requests/$requestId';
  static const String emergencyRequests = '/requests/emergency';

  // Matching + Search + AI
  static const String runMatching = '/matching/run';
  static const String searchDonors = '/search/donors';
  static const String matchingCandidates = '/matching/candidates';
  static const String chatbotQuestions = '/ai/chatbot/questions';
  static const String chatbotAsk = '/ai/chatbot/ask';
  static const String bloodGroupDetect = '/ai/blood-group/detect';

  // Hospital
  static const String hospitalRequests = '/hospital/requests';
  static const String pendingVerifications = '/hospital/verifications/pending';
  static String updateVerification(int donorId) =>
      '/hospital/verifications/$donorId';
  static String updateRequestStatus(int requestId) =>
      '/hospital/requests/$requestId/status';

  // Notifications
  static const String myNotifications = '/notifications/';
  static String markNotificationRead(int notificationId) =>
      '/notifications/$notificationId/read';

  // Admin
  static const String adminAudit = '/admin/audit';
  static const String adminSummary = '/admin/reports/summary';
  static const String adminAnalytics = '/admin/reports/analytics';
  static const String adminUsers = '/admin/users';
  static String adminUpdateUser(int userId) => '/admin/users/$userId';
  static const String adminHospitals = '/admin/hospitals';
  static String adminUpdateHospital(int hospitalId) =>
      '/admin/hospitals/$hospitalId';
  static const String adminInventory = '/admin/inventory';
  static String adminInventoryByGroup(String bloodGroup) =>
      '/admin/inventory/$bloodGroup';
}
