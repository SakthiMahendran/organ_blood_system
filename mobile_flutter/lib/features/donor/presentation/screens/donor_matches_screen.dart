import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../data/repositories/donor_repository.dart';
import '../providers/donor_providers.dart';

class DonorMatchesScreen extends ConsumerStatefulWidget {
  const DonorMatchesScreen({super.key});

  @override
  ConsumerState<DonorMatchesScreen> createState() => _DonorMatchesScreenState();
}

class _DonorMatchesScreenState extends ConsumerState<DonorMatchesScreen> {
  int? _processingMatchId;

  Future<void> _refresh() async {
    ref.invalidate(donorMatchesProvider);
  }

  Future<void> _respond(int matchId, String response) async {
    setState(() => _processingMatchId = matchId);
    try {
      final repo = await ref.read(donorRepositoryProvider.future);
      await repo.respondToMatch(matchId, response);
      ref.invalidate(donorMatchesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Match $response')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(ApiParser.extractMessage(error,
                  fallback: 'Unable to submit response.'))),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _processingMatchId = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final matchesAsync = ref.watch(donorMatchesProvider);

    return AppScaffold(
      title: 'My Matches',
      navItems: AppNavItems.donor,
      currentRoute: RoutePaths.donorMatches,
      notificationRoute: RoutePaths.donorNotifications,
      onRefresh: _refresh,
      body: matchesAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error,
              fallback: 'Failed to load matches.'),
          onRetry: () => ref.invalidate(donorMatchesProvider),
        ),
        data: (matches) {
          if (matches.isEmpty) {
            return const SizedBox(
              height: 280,
              child: Center(child: Text('No matches available.')),
            );
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: matches.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, index) {
              final match = matches[index];
              final isPending = match.donorResponse.toUpperCase() == 'PENDING';
              final busy = _processingMatchId == match.id;

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              'Request #${match.requestId}',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                          ),
                          StatusChip(label: match.donorResponse),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                          'Match score: ${match.matchScore.toStringAsFixed(1)}'),
                      Text(
                          'Created: ${AppFormatters.dateTime(match.createdAt)}'),
                      const SizedBox(height: 10),
                      if (isPending)
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: busy
                                    ? null
                                    : () => _respond(match.id, 'DECLINED'),
                                child: const Text('Decline'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: FilledButton(
                                onPressed: busy
                                    ? null
                                    : () => _respond(match.id, 'ACCEPTED'),
                                child: busy
                                    ? const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2),
                                      )
                                    : const Text('Accept'),
                              ),
                            ),
                          ],
                        ),
                    ],
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
