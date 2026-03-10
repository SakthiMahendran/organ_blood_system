import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/stat_card.dart';
import '../../../../services/api_parser.dart';
import '../../../../shared/widgets/distribution_bar.dart';
import '../../data/repositories/analytics_repository.dart';

class AdminAnalyticsScreen extends ConsumerWidget {
  const AdminAnalyticsScreen({super.key});

  String _formatLabel(String value) {
    return value
        .replaceAll('_', ' ')
        .toLowerCase()
        .split(' ')
        .where((token) => token.isNotEmpty)
        .map((token) => '${token[0].toUpperCase()}${token.substring(1)}')
        .join(' ');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final snapshotAsync = ref.watch(analyticsSnapshotProvider);

    return AppScaffold(
      title: 'Analytics',
      navItems: AppNavItems.admin,
      currentRoute: '/admin/analytics',
      onRefresh: () async => ref.invalidate(analyticsSnapshotProvider),
      body: snapshotAsync.when(
        loading: () => const ListSkeleton(count: 4),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error,
              fallback: 'Unable to load analytics.'),
          onRetry: () => ref.invalidate(analyticsSnapshotProvider),
        ),
        data: (data) {
          final statusMax = data.requestsByStatus.values.isEmpty
              ? 1
              : data.requestsByStatus.values.reduce((a, b) => a > b ? a : b);

          final bloodMax = data.bloodGroupDistribution.values.isEmpty
              ? 1
              : data.bloodGroupDistribution.values
                  .reduce((a, b) => a > b ? a : b);

          final emergencyMax = data.emergencyTrend.isEmpty
              ? 1
              : data.emergencyTrend.reduce((a, b) => a > b ? a : b);

          final activityMax = data.donationActivity.isEmpty
              ? 1
              : data.donationActivity.reduce((a, b) => a > b ? a : b);

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
                  StatCard(title: 'Donors', value: '${data.totalDonors}'),
                  StatCard(
                      title: 'Recipients', value: '${data.totalRecipients}'),
                  StatCard(
                      title: 'Total Requests', value: '${data.totalRequests}'),
                  StatCard(
                      title: 'Emergency', value: '${data.emergencyRequests}'),
                ],
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Requests by Status',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      ...data.requestsByStatus.entries.map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: DistributionBar(
                            label: _formatLabel(entry.key),
                            value: entry.value,
                            max: statusMax,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Blood Group Distribution',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      ...data.bloodGroupDistribution.entries.map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: DistributionBar(
                            label: entry.key,
                            value: entry.value,
                            max: bloodMax,
                            color: const Color(0xFF0B6E99),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Emergency Trend (Last 7 Days)',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 10),
                      ...List.generate(data.emergencyTrend.length, (index) {
                        final value = data.emergencyTrend[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              SizedBox(
                                  width: 52, child: Text('Day ${index + 1}')),
                              Expanded(
                                child: LinearProgressIndicator(
                                  value: (value / emergencyMax).clamp(0, 1),
                                  minHeight: 8,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                              const SizedBox(width: 8),
                              SizedBox(width: 28, child: Text('$value')),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Donation Activity (Last 7 Days)',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 10),
                      ...List.generate(data.donationActivity.length, (index) {
                        final value = data.donationActivity[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              SizedBox(
                                  width: 52, child: Text('Day ${index + 1}')),
                              Expanded(
                                child: LinearProgressIndicator(
                                  value: (value / activityMax).clamp(0, 1),
                                  minHeight: 8,
                                  borderRadius: BorderRadius.circular(999),
                                  valueColor:
                                      const AlwaysStoppedAnimation<Color>(
                                          Color(0xFF1AAE62)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              SizedBox(width: 28, child: Text('$value')),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
