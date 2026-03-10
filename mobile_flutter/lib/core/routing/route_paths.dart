import '../../features/auth/domain/user_role.dart';

class RoutePaths {
  const RoutePaths._();

  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String registerHospital = '/register/hospital';

  static const String donorDashboard = '/donor/dashboard';
  static const String donorProfile = '/donor/profile';
  static const String donorMatches = '/donor/matches';
  static const String donorNotifications = '/donor/notifications';
  static const String donorAiMatching = '/donor/ai-matching';
  static const String donorChatbot = '/donor/chatbot';
  static const String donorBloodDetection = '/donor/blood-detection';
  static const String donorEmergency = '/donor/emergency';
  static const String donorSettings = '/donor/settings';

  static const String acceptorDashboard = '/acceptor/dashboard';
  static const String acceptorCreateRequest = '/acceptor/create-request';
  static const String acceptorTrackRequests = '/acceptor/track-requests';
  static const String acceptorSearchDonors = '/acceptor/search-donors';
  static const String acceptorNotifications = '/acceptor/notifications';
  static const String acceptorAiMatching = '/acceptor/ai-matching';
  static const String acceptorChatbot = '/acceptor/chatbot';
  static const String acceptorEmergency = '/acceptor/emergency';
  static const String acceptorSettings = '/acceptor/settings';

  static const String hospitalDashboard = '/hospital/dashboard';
  static const String hospitalVerifyDonors = '/hospital/verify-donors';
  static const String hospitalRequests = '/hospital/requests';
  static const String hospitalAiMatching = '/hospital/ai-matching';
  static const String hospitalChatbot = '/hospital/chatbot';
  static const String hospitalEmergency = '/hospital/emergency';
  static const String hospitalSettings = '/hospital/settings';

  static const String adminDashboard = '/admin/dashboard';
  static const String adminUsers = '/admin/users';
  static const String adminHospitals = '/admin/hospitals';
  static const String adminAudit = '/admin/audit';
  static const String adminAnalytics = '/admin/analytics';
  static const String adminInventory = '/admin/inventory';
  static const String adminChatbot = '/admin/chatbot';
  static const String adminEmergency = '/admin/emergency';
  static const String adminSettings = '/admin/settings';

  static String defaultByRole(UserRole role) {
    switch (role) {
      case UserRole.donor:
        return donorDashboard;
      case UserRole.acceptor:
        return acceptorDashboard;
      case UserRole.hospital:
        return hospitalDashboard;
      case UserRole.admin:
        return adminDashboard;
      case UserRole.unknown:
        return login;
    }
  }
}
