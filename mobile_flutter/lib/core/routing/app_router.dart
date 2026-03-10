import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/nav_items.dart';
import '../../features/acceptor/presentation/screens/acceptor_create_request_screen.dart';
import '../../features/acceptor/presentation/screens/acceptor_dashboard_screen.dart';
import '../../features/acceptor/presentation/screens/acceptor_notifications_screen.dart';
import '../../features/acceptor/presentation/screens/acceptor_search_donors_screen.dart';
import '../../features/acceptor/presentation/screens/acceptor_track_requests_screen.dart';
import '../../features/admin/presentation/screens/admin_audit_screen.dart';
import '../../features/admin/presentation/screens/admin_dashboard_screen.dart';
import '../../features/admin/presentation/screens/admin_hospitals_screen.dart';
import '../../features/admin/presentation/screens/admin_users_screen.dart';
import '../../features/analytics/presentation/screens/admin_analytics_screen.dart';
import '../../features/auth/domain/user_role.dart';
import '../../features/auth/presentation/providers/auth_controller.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/hospital_register_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/blood_detection/presentation/screens/blood_detection_screen.dart';
import '../../features/chatbot/presentation/screens/chatbot_screen.dart';
import '../../features/donor/presentation/screens/donor_dashboard_screen.dart';
import '../../features/donor/presentation/screens/donor_matches_screen.dart';
import '../../features/donor/presentation/screens/donor_notifications_screen.dart';
import '../../features/donor/presentation/screens/donor_profile_screen.dart';
import '../../features/emergency/presentation/screens/emergency_requests_screen.dart';
import '../../features/hospital/presentation/screens/hospital_dashboard_screen.dart';
import '../../features/hospital/presentation/screens/hospital_requests_screen.dart';
import '../../features/hospital/presentation/screens/hospital_verify_donors_screen.dart';
import '../../features/inventory/presentation/screens/admin_inventory_screen.dart';
import '../../features/matching/presentation/screens/ai_matching_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';
import 'route_guard.dart';
import 'route_paths.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: RoutePaths.splash,
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isPublic = RouteGuard.isPublicRoute(location);

      if (auth.isBootstrapping) {
        return location == RoutePaths.splash ? null : RoutePaths.splash;
      }

      if (!auth.isAuthenticated) {
        return isPublic ? null : RoutePaths.login;
      }

      final userRole = auth.user?.userType ?? UserRole.unknown;
      final defaultRoute = RoutePaths.defaultByRole(userRole);

      if (location == RoutePaths.splash ||
          location == RoutePaths.login ||
          location == RoutePaths.register ||
          location == RoutePaths.registerHospital) {
        return defaultRoute;
      }

      final roleAllowed =
          RouteGuard.isRoleRouteAllowed(location, userRole.backendValue);
      if (!roleAllowed) {
        return defaultRoute;
      }

      return null;
    },
    routes: [
      GoRoute(
          path: RoutePaths.splash, builder: (_, __) => const SplashScreen()),
      GoRoute(path: RoutePaths.login, builder: (_, __) => const LoginScreen()),
      GoRoute(
          path: RoutePaths.register,
          builder: (_, __) => const RegisterScreen()),
      GoRoute(
          path: RoutePaths.registerHospital,
          builder: (_, __) => const HospitalRegisterScreen()),
      GoRoute(
          path: RoutePaths.donorDashboard,
          builder: (_, __) => const DonorDashboardScreen()),
      GoRoute(
          path: RoutePaths.donorProfile,
          builder: (_, __) => const DonorProfileScreen()),
      GoRoute(
          path: RoutePaths.donorMatches,
          builder: (_, __) => const DonorMatchesScreen()),
      GoRoute(
          path: RoutePaths.donorNotifications,
          builder: (_, __) => const DonorNotificationsScreen()),
      GoRoute(
        path: RoutePaths.donorAiMatching,
        builder: (_, __) => const AiMatchingScreen(
          title: 'AI Matching',
          currentRoute: RoutePaths.donorAiMatching,
          navItems: AppNavItems.donor,
          role: 'DONOR',
          notificationRoute: RoutePaths.donorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.donorChatbot,
        builder: (_, __) => const ChatbotScreen(
          title: 'AI Assistant',
          currentRoute: RoutePaths.donorChatbot,
          navItems: AppNavItems.donor,
          notificationRoute: RoutePaths.donorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.donorBloodDetection,
        builder: (_, __) => const BloodDetectionScreen(
          currentRoute: RoutePaths.donorBloodDetection,
          navItems: AppNavItems.donor,
          notificationRoute: RoutePaths.donorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.donorEmergency,
        builder: (_, __) => const EmergencyRequestsScreen(
          title: 'Emergency Requests',
          currentRoute: RoutePaths.donorEmergency,
          navItems: AppNavItems.donor,
          role: 'DONOR',
          canCreate: false,
          notificationRoute: RoutePaths.donorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.donorSettings,
        builder: (_, __) => const SettingsScreen(
          title: 'Settings',
          currentRoute: RoutePaths.donorSettings,
          navItems: AppNavItems.donor,
          notificationRoute: RoutePaths.donorNotifications,
        ),
      ),
      GoRoute(
          path: RoutePaths.acceptorDashboard,
          builder: (_, __) => const AcceptorDashboardScreen()),
      GoRoute(
          path: RoutePaths.acceptorCreateRequest,
          builder: (_, __) => const AcceptorCreateRequestScreen()),
      GoRoute(
          path: RoutePaths.acceptorTrackRequests,
          builder: (_, __) => const AcceptorTrackRequestsScreen()),
      GoRoute(
          path: RoutePaths.acceptorSearchDonors,
          builder: (_, __) => const AcceptorSearchDonorsScreen()),
      GoRoute(
          path: RoutePaths.acceptorNotifications,
          builder: (_, __) => const AcceptorNotificationsScreen()),
      GoRoute(
        path: RoutePaths.acceptorAiMatching,
        builder: (_, __) => const AiMatchingScreen(
          title: 'AI Matching',
          currentRoute: RoutePaths.acceptorAiMatching,
          navItems: AppNavItems.acceptor,
          role: 'ACCEPTOR',
          notificationRoute: RoutePaths.acceptorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.acceptorChatbot,
        builder: (_, __) => const ChatbotScreen(
          title: 'AI Assistant',
          currentRoute: RoutePaths.acceptorChatbot,
          navItems: AppNavItems.acceptor,
          notificationRoute: RoutePaths.acceptorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.acceptorEmergency,
        builder: (_, __) => const EmergencyRequestsScreen(
          title: 'Emergency Requests',
          currentRoute: RoutePaths.acceptorEmergency,
          navItems: AppNavItems.acceptor,
          role: 'ACCEPTOR',
          canCreate: true,
          notificationRoute: RoutePaths.acceptorNotifications,
        ),
      ),
      GoRoute(
        path: RoutePaths.acceptorSettings,
        builder: (_, __) => const SettingsScreen(
          title: 'Settings',
          currentRoute: RoutePaths.acceptorSettings,
          navItems: AppNavItems.acceptor,
          notificationRoute: RoutePaths.acceptorNotifications,
        ),
      ),
      GoRoute(
          path: RoutePaths.hospitalDashboard,
          builder: (_, __) => const HospitalDashboardScreen()),
      GoRoute(
          path: RoutePaths.hospitalVerifyDonors,
          builder: (_, __) => const HospitalVerifyDonorsScreen()),
      GoRoute(
          path: RoutePaths.hospitalRequests,
          builder: (_, __) => const HospitalRequestsScreen()),
      GoRoute(
        path: RoutePaths.hospitalAiMatching,
        builder: (_, __) => const AiMatchingScreen(
          title: 'AI Matching',
          currentRoute: RoutePaths.hospitalAiMatching,
          navItems: AppNavItems.hospital,
          role: 'HOSPITAL',
        ),
      ),
      GoRoute(
        path: RoutePaths.hospitalChatbot,
        builder: (_, __) => const ChatbotScreen(
          title: 'AI Assistant',
          currentRoute: RoutePaths.hospitalChatbot,
          navItems: AppNavItems.hospital,
        ),
      ),
      GoRoute(
        path: RoutePaths.hospitalEmergency,
        builder: (_, __) => const EmergencyRequestsScreen(
          title: 'Emergency Requests',
          currentRoute: RoutePaths.hospitalEmergency,
          navItems: AppNavItems.hospital,
          role: 'HOSPITAL',
          canCreate: false,
        ),
      ),
      GoRoute(
        path: RoutePaths.hospitalSettings,
        builder: (_, __) => const SettingsScreen(
          title: 'Settings',
          currentRoute: RoutePaths.hospitalSettings,
          navItems: AppNavItems.hospital,
        ),
      ),
      GoRoute(
          path: RoutePaths.adminDashboard,
          builder: (_, __) => const AdminDashboardScreen()),
      GoRoute(
          path: RoutePaths.adminUsers,
          builder: (_, __) => const AdminUsersScreen()),
      GoRoute(
          path: RoutePaths.adminHospitals,
          builder: (_, __) => const AdminHospitalsScreen()),
      GoRoute(
          path: RoutePaths.adminAudit,
          builder: (_, __) => const AdminAuditScreen()),
      GoRoute(
          path: RoutePaths.adminAnalytics,
          builder: (_, __) => const AdminAnalyticsScreen()),
      GoRoute(
          path: RoutePaths.adminInventory,
          builder: (_, __) => const AdminInventoryScreen()),
      GoRoute(
        path: RoutePaths.adminChatbot,
        builder: (_, __) => const ChatbotScreen(
          title: 'AI Assistant',
          currentRoute: RoutePaths.adminChatbot,
          navItems: AppNavItems.admin,
        ),
      ),
      GoRoute(
        path: RoutePaths.adminEmergency,
        builder: (_, __) => const EmergencyRequestsScreen(
          title: 'Emergency Monitor',
          currentRoute: RoutePaths.adminEmergency,
          navItems: AppNavItems.admin,
          role: 'ADMIN',
          canCreate: false,
        ),
      ),
      GoRoute(
        path: RoutePaths.adminSettings,
        builder: (_, __) => const SettingsScreen(
          title: 'Settings',
          currentRoute: RoutePaths.adminSettings,
          navItems: AppNavItems.admin,
        ),
      ),
    ],
  );
});
