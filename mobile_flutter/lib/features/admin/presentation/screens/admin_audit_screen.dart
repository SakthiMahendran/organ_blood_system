import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_retry.dart';
import '../../../../core/widgets/loading_skeleton.dart';
import '../../../../services/api_parser.dart';
import '../providers/admin_providers.dart';

class AdminAuditScreen extends ConsumerStatefulWidget {
  const AdminAuditScreen({super.key});

  @override
  ConsumerState<AdminAuditScreen> createState() => _AdminAuditScreenState();
}

class _AdminAuditScreenState extends ConsumerState<AdminAuditScreen> {
  final _actorController = TextEditingController();
  final _actionController = TextEditingController();

  String? _actor;
  String? _action;

  @override
  void dispose() {
    _actorController.dispose();
    _actionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final logsAsync =
        ref.watch(adminAuditProvider((actor: _actor, action: _action)));

    return AppScaffold(
      title: 'Audit Logs',
      navItems: AppNavItems.admin,
      currentRoute: '/admin/audit',
      onRefresh: () async =>
          ref.invalidate(adminAuditProvider((actor: _actor, action: _action))),
      body: Column(
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  TextField(
                    controller: _actorController,
                    decoration: const InputDecoration(
                        labelText: 'Actor (ID, email, or username)'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _actionController,
                    decoration:
                        const InputDecoration(labelText: 'Action contains'),
                  ),
                  const SizedBox(height: 10),
                  FilledButton.icon(
                    onPressed: () {
                      setState(() {
                        _actor = _actorController.text.trim().isEmpty
                            ? null
                            : _actorController.text.trim();
                        _action = _actionController.text.trim().isEmpty
                            ? null
                            : _actionController.text.trim();
                      });
                    },
                    icon: const Icon(Icons.search),
                    label: const Text('Apply Filters'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          logsAsync.when(
            loading: () => const ListSkeleton(),
            error: (error, _) => ErrorRetryWidget(
              message: ApiParser.extractMessage(error),
              onRetry: () => ref.invalidate(
                  adminAuditProvider((actor: _actor, action: _action))),
            ),
            data: (logs) {
              if (logs.isEmpty) {
                return const EmptyStateWidget(
                    title: 'No Audit Logs',
                    message: 'No records match your filters.');
              }

              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: logs.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (_, index) {
                  final log = logs[index];
                  return Card(
                    child: ListTile(
                      title: Text(log.action),
                      subtitle: Text(
                        'Actor: ${log.actorEmail ?? '-'}\n${log.entityType} #${log.entityId}\n${AppFormatters.dateTime(log.createdAt)}',
                      ),
                      isThreeLine: true,
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
