import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/models/app_notification.dart';
import '../services/notification_repository.dart';

class NotificationsController
    extends AutoDisposeAsyncNotifier<List<AppNotification>> {
  @override
  Future<List<AppNotification>> build() async {
    final repository = await ref.watch(notificationRepositoryProvider.future);
    return repository.fetchNotifications();
  }

  Future<void> refreshNotifications() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = await ref.read(notificationRepositoryProvider.future);
      return repository.fetchNotifications();
    });
  }

  Future<void> markRead(int id) async {
    final repository = await ref.read(notificationRepositoryProvider.future);
    await repository.markAsRead(id);
    final current = state.value ?? const <AppNotification>[];
    state = AsyncData(
      current
          .map((item) => item.id == id
              ? AppNotification(
                  id: item.id,
                  title: item.title,
                  message: item.message,
                  type: item.type,
                  isRead: true,
                  createdAt: item.createdAt,
                )
              : item)
          .toList(growable: false),
    );
  }
}

final notificationsControllerProvider = AutoDisposeAsyncNotifierProvider<
    NotificationsController, List<AppNotification>>(
  NotificationsController.new,
);

final unreadNotificationCountProvider = Provider.autoDispose<int>((ref) {
  final notifications = ref.watch(notificationsControllerProvider).value ??
      const <AppNotification>[];
  return notifications.where((item) => !item.isRead).length;
});
