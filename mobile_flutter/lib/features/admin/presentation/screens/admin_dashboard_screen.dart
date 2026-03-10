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
import '../providers/admin_providers.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(adminSummaryProvider);

    return AppScaffold(
      title: 'Admin Dashboard',
      navItems: AppNavItems.admin,
      currentRoute: RoutePaths.adminDashboard,
      onRefresh: () async => ref.invalidate(adminSummaryProvider),
      body: summaryAsync.when(
        loading: () => const ListSkeleton(count: 4),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () => ref.invalidate(adminSummaryProvider),
        ),
        data: (summary) {
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
                      title: 'Total Users', value: '${summary.totalUsers}'),
                  StatCard(
                      title: 'Total Donors', value: '${summary.totalDonors}'),
                  StatCard(
                      title: 'Verified Donors',
                      value: '${summary.verifiedDonors}'),
                  StatCard(
                      title: 'Active Requests',
                      value: '${summary.activeRequests}'),
                  StatCard(
                      title: 'Fulfilled',
                      value: '${summary.fulfilledRequests}'),
                ],
              ),
              const SizedBox(height: 14),
              Text('Admin Actions',
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
                    title: 'Analytics',
                    subtitle: 'View charts, trends and status breakdowns',
                    icon: Icons.analytics_outlined,
                    onTap: () => context.go(RoutePaths.adminAnalytics),
                  ),
                  FeatureActionCard(
                    title: 'Inventory',
                    subtitle: 'Monitor blood stock and low-inventory alerts',
                    icon: Icons.inventory_2_outlined,
                    onTap: () => context.go(RoutePaths.adminInventory),
                  ),
                  FeatureActionCard(
                    title: 'Manage Users',
                    subtitle: 'Activate or deactivate donor/recipient accounts',
                    icon: Icons.people_alt_outlined,
                    onTap: () => context.go(RoutePaths.adminUsers),
                  ),
                  FeatureActionCard(
                    title: 'Manage Hospitals',
                    subtitle: 'Approve, suspend and monitor hospitals',
                    icon: Icons.local_hospital_outlined,
                    onTap: () => context.go(RoutePaths.adminHospitals),
                  ),
                  FeatureActionCard(
                    title: 'Emergency Monitor',
                    subtitle: 'Track urgent requests across the platform',
                    icon: Icons.warning_amber_rounded,
                    onTap: () => context.go(RoutePaths.adminEmergency),
                    accent: const Color(0xFFC62828),
                  ),
                  FeatureActionCard(
                    title: 'Audit Logs',
                    subtitle: 'Review actor actions and compliance events',
                    icon: Icons.fact_check_outlined,
                    onTap: () => context.go(RoutePaths.adminAudit),
                  ),
                  FeatureActionCard(
                    title: 'AI Chatbot',
                    subtitle: 'Admin assistant for workflows and insights',
                    icon: Icons.chat_bubble_outline,
                    onTap: () => context.go(RoutePaths.adminChatbot),
                  ),
                  FeatureActionCard(
                    title: 'Settings',
                    subtitle: 'Privacy, notifications and support options',
                    icon: Icons.settings_outlined,
                    onTap: () => context.go(RoutePaths.adminSettings),
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
