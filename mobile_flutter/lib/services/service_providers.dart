import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../core/utils/auth_event_bus.dart';
import 'dio_client.dart';
import 'token_storage.dart';

final authEventBusProvider = Provider<AuthEventBus>((ref) {
  final bus = AuthEventBus();
  ref.onDispose(bus.dispose);
  return bus;
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(ref.watch(secureStorageProvider));
});

final dioProvider = FutureProvider<Dio>((ref) async {
  final tokenStorage = ref.watch(tokenStorageProvider);
  final authBus = ref.watch(authEventBusProvider);

  final client = DioClient(
    tokenStorage: tokenStorage,
    onUnauthorized: authBus.emitUnauthorized,
  );

  return client.create();
});

final publicDioProvider = Provider<Dio>((ref) {
  return Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      headers: const {'Content-Type': 'application/json'},
    ),
  );
});
