import 'package:flutter/foundation.dart';

class AppConfig {
  const AppConfig._();

  // Optional override: flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8000/api
  static const String _apiBaseUrlFromEnv =
      String.fromEnvironment('API_BASE_URL', defaultValue: '');

  static const String _productionApiUrl =
      'https://mrtechie-organ-blood-backend.hf.space/api';

  // Android emulator reaches host machine via 10.0.2.2; physical device needs
  // the host machine's LAN IP (e.g. 192.168.1.x).
  static const String _localApiUrl = 'http://10.0.2.2:8000/api';

  static String get apiBaseUrl {
    final configured = _normalizeBaseUrl(_apiBaseUrlFromEnv);
    if (configured.isNotEmpty) {
      return configured;
    }

    if (kDebugMode) {
      return _localApiUrl;
    }

    return _productionApiUrl;
  }

  static String _normalizeBaseUrl(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return trimmed;
    }
    return trimmed.replaceFirst(RegExp(r'/+$'), '');
  }

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 25);
}
