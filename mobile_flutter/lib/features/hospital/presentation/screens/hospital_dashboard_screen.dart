import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/stat_card.dart';
import '../../../../services/api_parser.dart';
import '../../../../shared/widgets/feature_action_card.dart';
import '../providers/hospital_providers.dart';

class HospitalDashboardScreen extends ConsumerWidget {
  const HospitalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(hospitalRequestsProvider);
    final verificationAsync = ref.watch(pendingVerificationsProvider);

    return AppScaffold(
      title: 'Hospital Dashboard',
      navItems: AppNavItems.hospital,
      currentRoute: RoutePaths.hospitalDashboard,
      onRefresh: () async {
        ref.invalidate(hospitalRequestsProvider);
        ref.invalidate(pendingVerificationsProvider);
      },
      body: requestsAsync.when(
        loading: () => const ListSkeleton(count: 3),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () {
            ref.invalidate(hospitalRequestsProvider);
            ref.invalidate(pendingVerificationsProvider);
          },
        ),
        data: (requests) {
          return verificationAsync.when(
            loading: () => const ListSkeleton(count: 2),
            error: (error, _) => ErrorRetryWidget(
              message: ApiParser.extractMessage(error),
              onRetry: () => ref.invalidate(pendingVerificationsProvider),
            ),
            data: (pending) {
              final approved = requests
                  .where((item) => item.status.toUpperCase() == 'APPROVED')
                  .length;
              final fulfilled = requests
                  .where((item) => item.status.toUpperCase() == 'FULFILLED')
                  .length;

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
                      StatCard(
                          title: 'Hospital Requests',
                          value: '${requests.length}'),
                      StatCard(
                          title: 'Pending Verify', value: '${pending.length}'),
                      StatCard(title: 'Approved', value: '$approved'),
                      StatCard(title: 'Fulfilled', value: '$fulfilled'),
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
                        title: 'Verify Donors',
                        subtitle:
                            'Approve or reject pending donor verification',
                        icon: Icons.verified_user_outlined,
                        onTap: () =>
                            context.go(RoutePaths.hospitalVerifyDonors),
                      ),
                      FeatureActionCard(
                        title: 'Manage Requests',
                        subtitle:
                            'Approve and fulfill linked recipient requests',
                        icon: Icons.assignment_outlined,
                        onTap: () => context.go(RoutePaths.hospitalRequests),
                      ),
                      FeatureActionCard(
                        title: 'AI Matching',
                        subtitle: 'Prioritize requests by compatibility score',
                        icon: Icons.auto_awesome,
                        onTap: () => context.go(RoutePaths.hospitalAiMatching),
                      ),
                      FeatureActionCard(
                        title: 'Emergency',
                        subtitle: 'Monitor urgent requests in real-time',
                        icon: Icons.warning_amber_rounded,
                        onTap: () => context.go(RoutePaths.hospitalEmergency),
                        accent: const Color(0xFFC62828),
                      ),
                      FeatureActionCard(
                        title: 'AI Chatbot',
                        subtitle: 'Hospital workflow assistant',
                        icon: Icons.chat_bubble_outline,
                        onTap: () => context.go(RoutePaths.hospitalChatbot),
                      ),
                      FeatureActionCard(
                        title: 'Settings',
                        subtitle: 'Alerts, privacy and support options',
                        icon: Icons.settings_outlined,
                        onTap: () => context.go(RoutePaths.hospitalSettings),
                      ),
                    ],
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
