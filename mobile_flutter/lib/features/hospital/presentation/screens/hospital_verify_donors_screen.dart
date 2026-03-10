import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../data/repositories/hospital_repository.dart';
import '../providers/hospital_providers.dart';

class HospitalVerifyDonorsScreen extends ConsumerStatefulWidget {
  const HospitalVerifyDonorsScreen({super.key});

  @override
  ConsumerState<HospitalVerifyDonorsScreen> createState() =>
      _HospitalVerifyDonorsScreenState();
}

class _HospitalVerifyDonorsScreenState
    extends ConsumerState<HospitalVerifyDonorsScreen> {
  int? _processingId;

  Future<void> _update(int donorId, String status) async {
    setState(() => _processingId = donorId);
    try {
      final repo = await ref.read(hospitalRepositoryProvider.future);
      await repo.updateVerification(donorId, status);
      ref.invalidate(pendingVerificationsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Donor $status.')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiParser.extractMessage(error))));
      }
    } finally {
      if (mounted) setState(() => _processingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendingAsync = ref.watch(pendingVerificationsProvider);

    return AppScaffold(
      title: 'Verify Donors',
      navItems: AppNavItems.hospital,
      currentRoute: '/hospital/verify-donors',
      onRefresh: () async => ref.invalidate(pendingVerificationsProvider),
      body: pendingAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () => ref.invalidate(pendingVerificationsProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyStateWidget(
                title: 'No Pending Donors',
                message: 'All donor verifications are complete.');
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, index) {
              final item = items[index];
              final busy = _processingId == item.id;

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(item.donorName,
                                style: Theme.of(context).textTheme.titleMedium),
                          ),
                          StatusChip(label: item.verificationStatus),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Blood Group: ${item.bloodGroup}'),
                      Text('City: ${item.city}'),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: busy
                                  ? null
                                  : () => _update(item.id, 'REJECTED'),
                              child: const Text('Reject'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: FilledButton(
                              onPressed: busy
                                  ? null
                                  : () => _update(item.id, 'VERIFIED'),
                              child: busy
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2))
                                  : const Text('Verify'),
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
