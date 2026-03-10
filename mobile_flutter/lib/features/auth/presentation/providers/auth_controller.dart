import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../features/auth/data/models/auth_user.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/service_providers.dart';
import '../../data/repositories/auth_repository.dart';
import '../../domain/user_role.dart';
import 'auth_state.dart';

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._ref) : super(AuthState.initial()) {
    _busSubscription =
        _ref.read(authEventBusProvider).unauthorizedStream.listen((_) async {
      await logout(localOnly: true);
    });
    bootstrap();
  }

  final Ref _ref;
  StreamSubscription<void>? _busSubscription;

  Future<AuthRepository> get _repo async =>
      _ref.read(authRepositoryProvider.future);

  AuthUser _buildDemoUser(UserRole role) {
    return AuthUser(
      id: 999,
      username: 'demo_${role.name}',
      email: '${role.name}.demo@example.com',
      phone: '9999999999',
      userType: role,
      isActive: true,
      address: 'Demo Address',
      city: 'Pune',
      state: 'Maharashtra',
      bloodGroup: role == UserRole.donor ? 'O+' : null,
    );
  }

  Future<void> bootstrap() async {
    state = state.copyWith(isBootstrapping: true, clearError: true);

    final demoSession = _ref.read(demoSessionProvider);
    if (demoSession.enabled) {
      state = state.copyWith(
        isBootstrapping: false,
        isAuthenticated: true,
        user: _buildDemoUser(demoSession.role),
        clearError: true,
      );
      return;
    }

    AuthRepository? repository;
    try {
      repository = await _repo.timeout(const Duration(seconds: 8));
      final hasSession =
          await repository.hasSession().timeout(const Duration(seconds: 5));
      if (!hasSession) {
        state = state.copyWith(
          isBootstrapping: false,
          isAuthenticated: false,
          clearUser: true,
          clearError: true,
        );
        return;
      }

      final user = await repository.me().timeout(const Duration(seconds: 30));
      state = state.copyWith(
        isBootstrapping: false,
        isAuthenticated: true,
        user: user,
        clearError: true,
      );
    } catch (error) {
      try {
        if (repository != null) {
          await repository.clearTokens();
        } else {
          await _ref.read(tokenStorageProvider).clear();
        }
      } catch (_) {
        // Ignore local token clear errors during startup recovery.
      }

      final message = error is TimeoutException
          ? 'Startup timeout. Please reopen the app.'
          : ApiParser.extractMessage(error);

      state = state.copyWith(
        isBootstrapping: false,
        isAuthenticated: false,
        clearUser: true,
        errorMessage: message,
      );
    }
  }

  Future<void> startOfflineDemo(UserRole role) async {
    _ref.read(demoSessionProvider.notifier).enable(role);
    state = state.copyWith(
      isLoading: false,
      isBootstrapping: false,
      isAuthenticated: true,
      user: _buildDemoUser(role),
      clearError: true,
    );
  }

  Future<bool> login(
      {required String identifier, required String password}) async {
    state = state.copyWith(isLoading: true, clearError: true);

    _ref.read(demoSessionProvider.notifier).disable();

    try {
      final repository = await _repo;
      final payload =
          await repository.login(identifier: identifier, password: password);
      await repository.persistTokens(payload.$2);

      state = state.copyWith(
        isLoading: false,
        isBootstrapping: false,
        isAuthenticated: true,
        user: payload.$1,
        clearError: true,
      );
      return true;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        clearUser: true,
        errorMessage:
            ApiParser.extractMessage(error, fallback: 'Login failed.'),
      );
      return false;
    }
  }

  Future<bool> register({
    required String username,
    required String email,
    required String phone,
    required String password,
    required String address,
    required String city,
    required String stateValue,
    required UserRole role,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    _ref.read(demoSessionProvider.notifier).disable();

    try {
      final repository = await _repo;
      final payload = await repository.register(
        username: username,
        email: email,
        phone: phone,
        password: password,
        address: address,
        city: city,
        state: stateValue,
        role: role.backendValue,
      );
      await repository.persistTokens(payload.$2);

      state = state.copyWith(
        isLoading: false,
        isBootstrapping: false,
        isAuthenticated: true,
        user: payload.$1,
        clearError: true,
      );
      return true;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        clearUser: true,
        errorMessage:
            ApiParser.extractMessage(error, fallback: 'Registration failed.'),
      );
      return false;
    }
  }

  Future<bool> registerHospital({
    required String hospitalName,
    required String registrationNumber,
    required String institutionType,
    required String email,
    required String phone,
    required String addressLine1,
    String? addressLine2,
    required String city,
    required String stateValue,
    required String pincode,
    required String contactPersonName,
    required String contactPersonRole,
    required String contactPersonPhone,
    required bool bloodBankAvailable,
    required bool organTransplantSupport,
    required bool emergencyResponse,
    required List<String> supportedBloodGroups,
    required String password,
    required String confirmPassword,
    String? licenseDocumentName,
    String? hospitalIdProofName,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    _ref.read(demoSessionProvider.notifier).disable();

    try {
      final repository = await _repo;
      await repository.registerHospital(
        hospitalName: hospitalName,
        registrationNumber: registrationNumber,
        institutionType: institutionType,
        email: email,
        phone: phone,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        city: city,
        state: stateValue,
        pincode: pincode,
        contactPersonName: contactPersonName,
        contactPersonRole: contactPersonRole,
        contactPersonPhone: contactPersonPhone,
        bloodBankAvailable: bloodBankAvailable,
        organTransplantSupport: organTransplantSupport,
        emergencyResponse: emergencyResponse,
        supportedBloodGroups: supportedBloodGroups,
        password: password,
        confirmPassword: confirmPassword,
        licenseDocumentName: licenseDocumentName,
        hospitalIdProofName: hospitalIdProofName,
      );

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        clearUser: true,
        clearError: true,
      );
      return true;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        clearUser: true,
        errorMessage: ApiParser.extractMessage(error,
            fallback: 'Hospital registration failed.'),
      );
      return false;
    }
  }

  Future<void> refreshProfile() async {
    final demoSession = _ref.read(demoSessionProvider);
    if (demoSession.enabled) {
      state = state.copyWith(
          user: _buildDemoUser(demoSession.role),
          isAuthenticated: true,
          clearError: true);
      return;
    }

    try {
      final user = await (await _repo).me();
      state =
          state.copyWith(user: user, isAuthenticated: true, clearError: true);
    } catch (error) {
      state = state.copyWith(errorMessage: ApiParser.extractMessage(error));
    }
  }

  Future<void> logout({bool localOnly = false}) async {
    final demoSession = _ref.read(demoSessionProvider);
    _ref.read(demoSessionProvider.notifier).disable();

    if (!demoSession.enabled) {
      final repository = await _repo;
      if (!localOnly) {
        await repository.logout();
      }
      await repository.clearTokens();
    }

    state = state.copyWith(
      isLoading: false,
      isAuthenticated: false,
      clearUser: true,
      clearError: true,
      isBootstrapping: false,
    );
  }

  @override
  void dispose() {
    _busSubscription?.cancel();
    super.dispose();
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(ref);
});
