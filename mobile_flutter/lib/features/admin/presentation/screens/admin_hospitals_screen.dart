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

class AdminHospitalsScreen extends ConsumerStatefulWidget {
  const AdminHospitalsScreen({super.key});

  @override
  ConsumerState<AdminHospitalsScreen> createState() =>
      _AdminHospitalsScreenState();
}

class _AdminHospitalsScreenState extends ConsumerState<AdminHospitalsScreen> {
  int? _processingId;
  static const _statuses = ['PENDING', 'APPROVED', 'SUSPENDED'];

  Future<void> _updateStatus(int id, String status) async {
    setState(() => _processingId = id);
    try {
      final repo = await ref.read(adminRepositoryProvider.future);
      await repo.updateHospitalStatus(hospitalId: id, approvalStatus: status);
      ref.invalidate(adminHospitalsProvider);
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
    final hospitalsAsync = ref.watch(adminHospitalsProvider);

    return AppScaffold(
      title: 'Manage Hospitals',
      navItems: AppNavItems.admin,
      currentRoute: '/admin/hospitals',
      onRefresh: () async => ref.invalidate(adminHospitalsProvider),
      body: hospitalsAsync.when(
        loading: () => const ListSkeleton(),
        error: (error, _) => ErrorRetryWidget(
          message: ApiParser.extractMessage(error),
          onRetry: () => ref.invalidate(adminHospitalsProvider),
        ),
        data: (hospitals) {
          if (hospitals.isEmpty) {
            return const EmptyStateWidget(
                title: 'No Hospitals', message: 'No hospitals found.');
          }

          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: hospitals.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, index) {
              final hospital = hospitals[index];
              final busy = _processingId == hospital.id;

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                              child: Text(hospital.name,
                                  style:
                                      Theme.of(context).textTheme.titleMedium)),
                          StatusChip(label: hospital.approvalStatus),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('License: ${hospital.licenseId}'),
                      Text('Location: ${hospital.city}, ${hospital.state}'),
                      Text(
                          'Created: ${AppFormatters.dateTime(hospital.createdAt)}'),
                      const SizedBox(height: 10),
                      DropdownButtonFormField<String>(
                        initialValue: hospital.approvalStatus,
                        decoration:
                            const InputDecoration(labelText: 'Approval Status'),
                        items: _statuses
                            .map((status) => DropdownMenuItem(
                                value: status, child: Text(status)))
                            .toList(),
                        onChanged: busy
                            ? null
                            : (value) {
                                if (value != null &&
                                    value != hospital.approvalStatus) {
                                  _updateStatus(hospital.id, value);
                                }
                              },
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
