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
import '../../data/repositories/acceptor_repository.dart';
import '../providers/acceptor_providers.dart';

class AcceptorTrackRequestsScreen extends ConsumerStatefulWidget {
  const AcceptorTrackRequestsScreen({super.key});

  @override
  ConsumerState<AcceptorTrackRequestsScreen> createState() =>
      _AcceptorTrackRequestsScreenState();
}

class _AcceptorTrackRequestsScreenState
    extends ConsumerState<AcceptorTrackRequestsScreen> {
  String _filter = 'ALL';
  int? _processingId;

  static const _lifecycle = [
    'SUBMITTED',
    'MATCHING',
    'MATCHED',
    'ACCEPTED',
    'PROCESSING',
    'FULFILLED'
  ];

  Future<void> _cancelRequest(int requestId) async {
    setState(() => _processingId = requestId);
    try {
      final repo = await ref.read(acceptorRepositoryProvider.future);
      await repo.cancelRequest(requestId);
      ref.invalidate(acceptorRequestsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Request cancelled.')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiParser.extractMessage(error))));
      }
    } finally {
      if (mounted) {
        setState(() => _processingId = null);
      }
    }
  }

  Future<void> _editRequest(int requestId) async {
    final urgencyController = TextEditingController(text: 'HIGH');
    final dateController = TextEditingController();
    final notesController = TextEditingController();

    final update = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Edit Request'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                initialValue: urgencyController.text,
                decoration: const InputDecoration(labelText: 'Urgency'),
                items: const ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']
                    .map((item) =>
                        DropdownMenuItem(value: item, child: Text(item)))
                    .toList(),
                onChanged: (value) => urgencyController.text = value ?? 'HIGH',
              ),
              const SizedBox(height: 10),
              TextField(
                controller: dateController,
                decoration: const InputDecoration(
                    labelText: 'Required Date (YYYY-MM-DD)'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: notesController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Notes'),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel')),
            FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Save')),
          ],
        );
      },
    );

    if (update != true) {
      urgencyController.dispose();
      dateController.dispose();
      notesController.dispose();
      return;
    }

    setState(() => _processingId = requestId);
    try {
      final repo = await ref.read(acceptorRepositoryProvider.future);
      await repo.updateRequest(requestId, {
        'urgency': urgencyController.text.trim(),
        if (dateController.text.trim().isNotEmpty)
          'required_date': dateController.text.trim(),
        'notes': notesController.text.trim(),
      });
      ref.invalidate(acceptorRequestsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Request updated.')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiParser.extractMessage(error))));
      }
    } finally {
      urgencyController.dispose();
      dateController.dispose();
      notesController.dispose();
      if (mounted) {
        setState(() => _processingId = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final requestsAsync = ref.watch(acceptorRequestsProvider);

    return AppScaffold(
      title: 'Track Requests',
      navItems: AppNavItems.acceptor,
      currentRoute: RoutePaths.acceptorTrackRequests,
      notificationRoute: RoutePaths.acceptorNotifications,
      onRefresh: () async => ref.invalidate(acceptorRequestsProvider),
      body: requestsAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error,
              fallback: 'Failed to load requests.'),
          onRetry: () => ref.invalidate(acceptorRequestsProvider),
        ),
        data: (requests) {
          final filtered = _filter == 'ALL'
              ? requests
              : requests
                  .where((item) => item.status.toUpperCase() == _filter)
                  .toList(growable: false);

          if (filtered.isEmpty) {
            return const EmptyStateWidget(
                title: 'No Requests',
                message: 'No requests found for selected filter.');
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'ALL',
                  'SUBMITTED',
                  'MATCHING',
                  'MATCHED',
                  'ACCEPTED',
                  'PROCESSING',
                  'FULFILLED',
                  'CANCELLED',
                  'EMERGENCY'
                ]
                    .map(
                      (status) => ChoiceChip(
                        label: Text(status),
                        selected: _filter == status,
                        onSelected: (_) => setState(() => _filter = status),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (_, index) {
                  final item = filtered[index];
                  final statusUpper = item.status.toUpperCase();
                  final cancelAllowed =
                      !['FULFILLED', 'CANCELLED'].contains(statusUpper);
                  final editAllowed =
                      !['FULFILLED', 'CANCELLED'].contains(statusUpper);

                  final activeStep = _lifecycle.indexOf(statusUpper);

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
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium),
                              ),
                              StatusChip(label: item.status),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('Type: ${item.requestType}'),
                          Text(
                              'Need: ${item.requestType.toUpperCase() == 'BLOOD' ? '${item.bloodGroup} (${item.unitsNeeded ?? 0} units)' : item.organType ?? '-'}'),
                          Text('Urgency: ${item.urgency}'),
                          Text('Location: ${item.city}, ${item.state}'),
                          Text(
                              'Updated: ${AppFormatters.dateTime(item.updatedAt)}'),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: _lifecycle.map((step) {
                              final stepIndex = _lifecycle.indexOf(step);
                              final reached =
                                  activeStep >= 0 && stepIndex <= activeStep;
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 9, vertical: 5),
                                decoration: BoxDecoration(
                                  color: reached
                                      ? const Color(0xFFE3F2FD)
                                      : const Color(0xFFF3F5F7),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  step,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: reached
                                            ? const Color(0xFF0B6E99)
                                            : const Color(0xFF7B8794),
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () {
                                    showDialog<void>(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: Text('Request #${item.id}'),
                                        content: Text(
                                            item.notes?.isNotEmpty == true
                                                ? item.notes!
                                                : 'No notes provided.'),
                                        actions: [
                                          TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(context),
                                              child: const Text('Close'))
                                        ],
                                      ),
                                    );
                                  },
                                  child: const Text('View'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: FilledButton.tonal(
                                  onPressed:
                                      !editAllowed || _processingId == item.id
                                          ? null
                                          : () => _editRequest(item.id),
                                  child: const Text('Edit'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: FilledButton.tonal(
                                  onPressed:
                                      !cancelAllowed || _processingId == item.id
                                          ? null
                                          : () => _cancelRequest(item.id),
                                  child: _processingId == item.id
                                      ? const SizedBox(
                                          width: 14,
                                          height: 14,
                                          child: CircularProgressIndicator(
                                              strokeWidth: 2))
                                      : const Text('Cancel'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
