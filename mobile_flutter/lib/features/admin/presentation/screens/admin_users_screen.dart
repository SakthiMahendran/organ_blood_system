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
import '../../data/repositories/admin_repository.dart';
import '../providers/admin_providers.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  int? _processingId;

  Future<void> _toggleUser(int id, bool isActive) async {
    setState(() => _processingId = id);
    try {
      final repo = await ref.read(adminRepositoryProvider.future);
      await repo.updateUserStatus(userId: id, isActive: isActive);
      ref.invalidate(adminUsersProvider);
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
    final usersAsync = ref.watch(adminUsersProvider);

    return AppScaffold(
      title: 'Manage Users',
      navItems: AppNavItems.admin,
      currentRoute: '/admin/users',
      onRefresh: () async => ref.invalidate(adminUsersProvider),
      body: usersAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () => ref.invalidate(adminUsersProvider),
        ),
        data: (users) {
          if (users.isEmpty) {
            return const EmptyStateWidget(
                title: 'No Users', message: 'No users found.');
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: users.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, index) {
              final user = users[index];
              final busy = _processingId == user.id;

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                              child: Text(user.username,
                                  style:
                                      Theme.of(context).textTheme.titleMedium)),
                          StatusChip(
                              label: user.isActive ? 'ACTIVE' : 'INACTIVE'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Email: ${user.email}'),
                      Text('Phone: ${user.phone ?? '-'}'),
                      Text('Role: ${user.userType}'),
                      Text('Joined: ${AppFormatters.dateTime(user.createdAt)}'),
                      const SizedBox(height: 10),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Active'),
                        value: user.isActive,
                        onChanged: busy
                            ? null
                            : (value) => _toggleUser(user.id, value),
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
