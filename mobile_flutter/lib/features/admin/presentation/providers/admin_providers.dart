import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/admin_hospital_item.dart';
import '../../data/models/admin_summary.dart';
import '../../data/models/admin_user_item.dart';
import '../../data/models/audit_log_item.dart';
import '../../data/repositories/admin_repository.dart';

final adminSummaryProvider =
    FutureProvider.autoDispose<AdminSummary>((ref) async {
  final repository = await ref.watch(adminRepositoryProvider.future);
  return repository.fetchSummary();
});

final adminUsersProvider =
    FutureProvider.autoDispose<List<AdminUserItem>>((ref) async {
  final repository = await ref.watch(adminRepositoryProvider.future);
  return repository.fetchUsers();
});

final adminHospitalsProvider =
    FutureProvider.autoDispose<List<AdminHospitalItem>>((ref) async {
  final repository = await ref.watch(adminRepositoryProvider.future);
  return repository.fetchHospitals();
});

final adminAuditProvider = FutureProvider.autoDispose
    .family<List<AuditLogItem>, ({String? actor, String? action})>(
  (ref, query) async {
    final repository = await ref.watch(adminRepositoryProvider.future);
    return repository.fetchAuditLogs(
        actorQuery: query.actor, action: query.action);
  },
);
