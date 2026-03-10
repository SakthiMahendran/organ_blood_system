import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/domain/user_role.dart';

class DemoSession {
  const DemoSession({required this.enabled, required this.role});

  const DemoSession.disabled()
      : enabled = false,
        role = UserRole.unknown;

  final bool enabled;
  final UserRole role;
}

class DemoSessionController extends StateNotifier<DemoSession> {
  DemoSessionController() : super(const DemoSession.disabled());

  void enable(UserRole role) {
    state = DemoSession(enabled: true, role: role);
  }

  void disable() {
    state = const DemoSession.disabled();
  }
}

final demoSessionProvider =
    StateNotifierProvider<DemoSessionController, DemoSession>((ref) {
  return DemoSessionController();
});
