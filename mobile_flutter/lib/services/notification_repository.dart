import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/demo/demo_mode.dart';
import '../core/demo/demo_store.dart';
import '../core/models/app_notification.dart';
import '../services/api_parser.dart';
import '../services/endpoints.dart';
import '../services/service_providers.dart';

class NotificationRepository {
  NotificationRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<List<AppNotification>> fetchNotifications() async {
    if (_isDemo) {
      return _demoStore.getNotifications();
    }

    final response = await _dio.get(Endpoints.myNotifications);
    final list = ApiParser.parse<List<dynamic>>(response);
    return list
        .whereType<Map<String, dynamic>>()
        .map(AppNotification.fromJson)
        .toList(growable: false);
  }

  Future<void> markAsRead(int notificationId) async {
    if (_isDemo) {
      _demoStore.markNotificationRead(notificationId);
      return;
    }

    await _dio.patch(Endpoints.markNotificationRead(notificationId));
  }
}

final notificationRepositoryProvider =
    FutureProvider<NotificationRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final store = ref.watch(demoStoreProvider);
  return NotificationRepository(dio, ref, store);
});
