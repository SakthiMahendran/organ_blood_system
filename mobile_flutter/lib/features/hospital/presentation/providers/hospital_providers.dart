import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/models/request_item.dart';
import '../../data/models/verification_item.dart';
import '../../data/repositories/hospital_repository.dart';

final hospitalRequestsProvider =
    FutureProvider.autoDispose<List<RequestItem>>((ref) async {
  final repository = await ref.watch(hospitalRepositoryProvider.future);
  return repository.fetchHospitalRequests();
});

final pendingVerificationsProvider =
    FutureProvider.autoDispose<List<VerificationItem>>((ref) async {
  final repository = await ref.watch(hospitalRepositoryProvider.future);
  return repository.fetchPendingVerifications();
});
