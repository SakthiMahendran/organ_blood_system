import 'package:flutter_riverpod/flutter_riverpod.dart';

class AppSettingsState {
  const AppSettingsState({
    required this.notificationsEnabled,
    required this.privacyMode,
    required this.emergencyAlertsEnabled,
  });

  factory AppSettingsState.defaults() {
    return const AppSettingsState(
      notificationsEnabled: true,
      privacyMode: false,
      emergencyAlertsEnabled: true,
    );
  }

  final bool notificationsEnabled;
  final bool privacyMode;
  final bool emergencyAlertsEnabled;

  AppSettingsState copyWith({
    bool? notificationsEnabled,
    bool? privacyMode,
    bool? emergencyAlertsEnabled,
  }) {
    return AppSettingsState(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      privacyMode: privacyMode ?? this.privacyMode,
      emergencyAlertsEnabled:
          emergencyAlertsEnabled ?? this.emergencyAlertsEnabled,
    );
  }
}

class AppSettingsController extends StateNotifier<AppSettingsState> {
  AppSettingsController() : super(AppSettingsState.defaults());

  void setNotifications(bool value) =>
      state = state.copyWith(notificationsEnabled: value);
  void setPrivacyMode(bool value) => state = state.copyWith(privacyMode: value);
  void setEmergencyAlerts(bool value) =>
      state = state.copyWith(emergencyAlertsEnabled: value);
}

final appSettingsProvider =
    StateNotifierProvider<AppSettingsController, AppSettingsState>((ref) {
  return AppSettingsController();
});
