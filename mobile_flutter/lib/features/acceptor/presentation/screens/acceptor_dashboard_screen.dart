import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/models/request_item.dart';
import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/stat_card.dart';
import '../../../../services/api_parser.dart';
import '../../../../shared/widgets/feature_action_card.dart';
import '../providers/acceptor_providers.dart';

class AcceptorDashboardScreen extends ConsumerWidget {
  const AcceptorDashboardScreen({super.key});

  int _countByStatus(List<RequestItem> requests, List<String> statuses) {
    return requests
        .where((item) => statuses.contains(item.status.toUpperCase()))
        .length;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(acceptorRequestsProvider);

    return AppScaffold(
      title: 'Recipient Dashboard',
      navItems: AppNavItems.acceptor,
      currentRoute: RoutePaths.acceptorDashboard,
      notificationRoute: RoutePaths.acceptorNotifications,
      onRefresh: () async => ref.invalidate(acceptorRequestsProvider),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go(RoutePaths.acceptorCreateRequest),
        label: const Text('Create Request'),
        icon: const Icon(Icons.add),
      ),
      body: requestsAsync.when(
        loading: () => const ListSkeleton(count: 3),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error,
              fallback: 'Failed to load dashboard.'),
          onRetry: () => ref.invalidate(acceptorRequestsProvider),
        ),
        data: (requests) {
          final active = requests
              .where((r) =>
                  !['FULFILLED', 'CANCELLED'].contains(r.status.toUpperCase()))
              .length;
          final matched = _countByStatus(requests, ['MATCHED', 'APPROVED']);
          final fulfilled = _countByStatus(requests, ['FULFILLED']);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.6,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                children: [
                  StatCard(title: 'Active Requests', value: '$active'),
                  StatCard(title: 'Matched/Approved', value: '$matched'),
                  StatCard(title: 'Fulfilled', value: '$fulfilled'),
                  StatCard(title: 'Total', value: '${requests.length}'),
                ],
              ),
              const SizedBox(height: 14),
              Text('Quick Actions',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 10),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.25,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                children: [
                  FeatureActionCard(
                    title: 'AI Matching',
                    subtitle: 'Find high-compatibility candidates quickly',
                    icon: Icons.auto_awesome,
                    onTap: () => context.go(RoutePaths.acceptorAiMatching),
                  ),
                  FeatureActionCard(
                    title: 'Emergency',
                    subtitle: 'Create one-tap emergency requests',
                    icon: Icons.warning_amber_rounded,
                    onTap: () => context.go(RoutePaths.acceptorEmergency),
                    accent: const Color(0xFFC62828),
                  ),
                  FeatureActionCard(
                    title: 'Search Donors',
                    subtitle: 'Advanced filters and compatibility preview',
                    icon: Icons.search,
                    onTap: () => context.go(RoutePaths.acceptorSearchDonors),
                  ),
                  FeatureActionCard(
                    title: 'Track Requests',
                    subtitle: 'Review request timeline and lifecycle',
                    icon: Icons.timeline_outlined,
                    onTap: () => context.go(RoutePaths.acceptorTrackRequests),
                  ),
                  FeatureActionCard(
                    title: 'AI Chatbot',
                    subtitle: 'Ask process and medical requirement questions',
                    icon: Icons.chat_bubble_outline,
                    onTap: () => context.go(RoutePaths.acceptorChatbot),
                  ),
                  FeatureActionCard(
                    title: 'Settings',
                    subtitle: 'Alerts, privacy and support options',
                    icon: Icons.settings_outlined,
                    onTap: () => context.go(RoutePaths.acceptorSettings),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}
