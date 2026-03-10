import '../../data/models/auth_user.dart';

class AuthState {
  const AuthState({
    required this.isBootstrapping,
    required this.isLoading,
    required this.isAuthenticated,
    this.user,
    this.errorMessage,
  });

  factory AuthState.initial() => const AuthState(
        isBootstrapping: true,
        isLoading: false,
        isAuthenticated: false,
      );

  final bool isBootstrapping;
  final bool isLoading;
  final bool isAuthenticated;
  final AuthUser? user;
  final String? errorMessage;

  AuthState copyWith({
    bool? isBootstrapping,
    bool? isLoading,
    bool? isAuthenticated,
    AuthUser? user,
    bool clearUser = false,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AuthState(
      isBootstrapping: isBootstrapping ?? this.isBootstrapping,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: clearUser ? null : (user ?? this.user),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
