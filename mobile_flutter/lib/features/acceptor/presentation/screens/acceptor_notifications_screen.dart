import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/notification_providers.dart';

class AcceptorNotificationsScreen extends ConsumerWidget {
  const AcceptorNotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsControllerProvider);

    return AppScaffold(
      title: 'Notifications',
      navItems: AppNavItems.acceptor,
      currentRoute: RoutePaths.acceptorNotifications,
      notificationRoute: RoutePaths.acceptorNotifications,
      onRefresh: () => ref
          .read(notificationsControllerProvider.notifier)
          .refreshNotifications(),
      body: notificationsAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () => ref.invalidate(notificationsControllerProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyStateWidget(
                title: 'No notifications', message: 'You are all caught up.');
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, index) {
              final item = items[index];
              return Card(
                child: ListTile(
                  title: Text(item.title),
                  subtitle: Text(
                      '${item.message}\n${AppFormatters.dateTime(item.createdAt)}'),
                  isThreeLine: true,
                  trailing: item.isRead
                      ? const StatusChip(label: 'Read')
                      : FilledButton.tonal(
                          onPressed: () => ref
                              .read(notificationsControllerProvider.notifier)
                              .markRead(item.id),
                          child: const Text('Mark read'),
                        ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
