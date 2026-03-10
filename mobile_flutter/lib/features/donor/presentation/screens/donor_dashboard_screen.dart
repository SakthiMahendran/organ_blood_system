import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/stat_card.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/notification_providers.dart';
import '../../../../shared/widgets/feature_action_card.dart';
import '../../data/repositories/donor_repository.dart';
import '../providers/donor_providers.dart';

class DonorDashboardScreen extends ConsumerStatefulWidget {
  const DonorDashboardScreen({super.key});

  @override
  ConsumerState<DonorDashboardScreen> createState() =>
      _DonorDashboardScreenState();
}

class _DonorDashboardScreenState extends ConsumerState<DonorDashboardScreen> {
  bool _availabilitySaving = false;

  Future<void> _refresh() async {
    ref.invalidate(donorProfileProvider);
    ref.invalidate(donorMatchesProvider);
    await ref
        .read(notificationsControllerProvider.notifier)
        .refreshNotifications();
  }

  Future<void> _toggleAvailability(String currentStatus) async {
    setState(() => _availabilitySaving = true);
    try {
      final repository = await ref.read(donorRepositoryProvider.future);
      final next = currentStatus == 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE';
      await repository.updateAvailability(next);
      ref.invalidate(donorProfileProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Availability updated.')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Failed to update availability.'))));
      }
    } finally {
      if (mounted) {
        setState(() => _availabilitySaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(donorProfileProvider);
    final matchesAsync = ref.watch(donorMatchesProvider);
    final unreadCount = ref.watch(unreadNotificationCountProvider);

    return AppScaffold(
      title: 'Donor Dashboard',
      navItems: AppNavItems.donor,
      currentRoute: RoutePaths.donorDashboard,
      notificationRoute: RoutePaths.donorNotifications,
      onRefresh: _refresh,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          profileAsync.when(
            loading: () => const ListSkeleton(count: 1),
            error: (error, _) => ErrorRetryWidget(
              message: ApiParser.extractMessage(error,
                  fallback: 'Failed to load profile.'),
              onRetry: () => ref.invalidate(donorProfileProvider),
            ),
            data: (profile) {
              if (profile == null) {
                return const EmptyStateWidget(
                  title: 'Profile Not Setup',
                  message:
                      'Complete your donor profile to receive verified matches.',
                );
              }

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Verification: ${profile.verificationStatus}',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 10),
                      Text(
                          'Last updated: ${AppFormatters.dateTime(profile.updatedAt)}'),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                              child: Text(
                                  'Availability: ${profile.availabilityStatus}')),
                          FilledButton.tonalIcon(
                            onPressed: _availabilitySaving
                                ? null
                                : () => _toggleAvailability(
                                    profile.availabilityStatus),
                            icon: _availabilitySaving
                                ? const SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Icon(Icons.swap_horiz),
                            label: const Text('Toggle'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 14),
          matchesAsync.when(
            data: (matches) {
              return GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.6,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                children: [
                  StatCard(title: 'Matches', value: '${matches.length}'),
                  StatCard(title: 'Unread Alerts', value: '$unreadCount'),
                ],
              );
            },
            loading: () => const ListSkeleton(count: 2),
            error: (error, _) => ErrorRetryWidget(
              message: ApiParser.extractMessage(error),
              onRetry: () => ref.invalidate(donorMatchesProvider),
            ),
          ),
          const SizedBox(height: 14),
          Text('Quick Actions', style: Theme.of(context).textTheme.titleMedium),
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
                subtitle: 'View compatibility and confidence insights',
                icon: Icons.auto_awesome,
                onTap: () => context.go(RoutePaths.donorAiMatching),
              ),
              FeatureActionCard(
                title: 'Emergency',
                subtitle: 'Monitor urgent requests in your area',
                icon: Icons.warning_amber_rounded,
                onTap: () => context.go(RoutePaths.donorEmergency),
                accent: const Color(0xFFC62828),
              ),
              FeatureActionCard(
                title: 'AI Chatbot',
                subtitle: 'Ask donation and eligibility questions',
                icon: Icons.chat_bubble_outline,
                onTap: () => context.go(RoutePaths.donorChatbot),
              ),
              FeatureActionCard(
                title: 'Blood Detection',
                subtitle: 'Run prototype blood group scan',
                icon: Icons.biotech_outlined,
                onTap: () => context.go(RoutePaths.donorBloodDetection),
              ),
              FeatureActionCard(
                title: 'Settings',
                subtitle: 'Privacy, notifications, and support',
                icon: Icons.settings_outlined,
                onTap: () => context.go(RoutePaths.donorSettings),
              ),
              FeatureActionCard(
                title: 'My Matches',
                subtitle: 'Accept or decline donor match requests',
                icon: Icons.favorite_border,
                onTap: () => context.go(RoutePaths.donorMatches),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
