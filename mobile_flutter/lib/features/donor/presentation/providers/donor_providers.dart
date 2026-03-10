import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/donor_profile.dart';
import '../../data/models/match_item.dart';
import '../../data/repositories/donor_repository.dart';

final donorProfileProvider =
    FutureProvider.autoDispose<DonorProfile?>((ref) async {
  final repository = await ref.watch(donorRepositoryProvider.future);
  return repository.fetchProfile();
});

final donorMatchesProvider =
    FutureProvider.autoDispose<List<MatchItem>>((ref) async {
  final repository = await ref.watch(donorRepositoryProvider.future);
  return repository.fetchMatches();
});
