import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/models/request_item.dart';
import '../../data/repositories/acceptor_repository.dart';

final acceptorRequestsProvider =
    FutureProvider.autoDispose<List<RequestItem>>((ref) async {
  final repository = await ref.watch(acceptorRepositoryProvider.future);
  return repository.fetchMyRequests();
});
