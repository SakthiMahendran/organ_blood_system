import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../data/repositories/hospital_repository.dart';
import '../providers/hospital_providers.dart';

class HospitalRequestsScreen extends ConsumerStatefulWidget {
  const HospitalRequestsScreen({super.key});

  @override
  ConsumerState<HospitalRequestsScreen> createState() =>
      _HospitalRequestsScreenState();
}

class _HospitalRequestsScreenState
    extends ConsumerState<HospitalRequestsScreen> {
  int? _processingId;

  Future<void> _runMatching(int requestId) async {
    setState(() => _processingId = requestId);
    try {
      final repo = await ref.read(hospitalRepositoryProvider.future);
      await repo.runMatching(requestId);
      ref.invalidate(hospitalRequestsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Matching completed.')));
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

  Future<void> _updateStatus(int requestId, String status) async {
    final notesController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Mark as $status'),
          content: TextField(
            controller: notesController,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Notes (optional)'),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel')),
            FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Update')),
          ],
        );
      },
    );

    if (confirmed != true) return;

    setState(() => _processingId = requestId);
    try {
      final repo = await ref.read(hospitalRepositoryProvider.future);
      await repo.updateRequestStatus(
        requestId: requestId,
        status: status,
        notes: notesController.text.trim().isEmpty
            ? null
            : notesController.text.trim(),
      );
      ref.invalidate(hospitalRequestsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Request marked $status.')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiParser.extractMessage(error))));
      }
    } finally {
      notesController.dispose();
      if (mounted) setState(() => _processingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final requestsAsync = ref.watch(hospitalRequestsProvider);

    return AppScaffold(
      title: 'Hospital Requests',
      navItems: AppNavItems.hospital,
      currentRoute: '/hospital/requests',
      onRefresh: () async => ref.invalidate(hospitalRequestsProvider),
      body: requestsAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () => ref.invalidate(hospitalRequestsProvider),
        ),
        data: (requests) {
          if (requests.isEmpty) {
            return const EmptyStateWidget(
                title: 'No Requests',
                message: 'No requests assigned to hospital.');
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: requests.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, index) {
              final item = requests[index];
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
                              child: Text('Request #${item.id}',
                                  style:
                                      Theme.of(context).textTheme.titleMedium)),
                          StatusChip(label: item.status),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Type: ${item.requestType}'),
                      Text(
                          'Need: ${item.requestType.toUpperCase() == 'BLOOD' ? '${item.bloodGroup} (${item.unitsNeeded ?? 0} units)' : item.organType ?? '-'}'),
                      Text('Urgency: ${item.urgency}'),
                      Text(
                          'Updated: ${AppFormatters.dateTime(item.updatedAt)}'),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          OutlinedButton(
                            onPressed:
                                busy ? null : () => _runMatching(item.id),
                            child: const Text('Run Matching'),
                          ),
                          FilledButton.tonal(
                            onPressed: busy
                                ? null
                                : () => _updateStatus(item.id, 'APPROVED'),
                            child: const Text('Approve'),
                          ),
                          FilledButton(
                            onPressed: busy
                                ? null
                                : () => _updateStatus(item.id, 'FULFILLED'),
                            child: busy
                                ? const SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2))
                                : const Text('Fulfill'),
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
