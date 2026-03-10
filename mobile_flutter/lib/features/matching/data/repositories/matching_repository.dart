import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/match_candidate.dart';

class MatchingRepository {
  MatchingRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<List<MatchCandidate>> fetchCandidates({
    required String role,
    required String type,
    String? bloodGroup,
    String? organType,
    String? city,
    String? state,
    String? urgency,
  }) async {
    if (_isDemo) {
      return _demoStore.getMatchingCandidates(
        role: role,
        type: type,
        bloodGroup: bloodGroup,
        organType: organType,
        city: city,
        state: state,
        urgency: urgency,
      );
    }

    final response = await _dio.get(
      Endpoints.matchingCandidates,
      queryParameters: {
        'role': role,
        'type': type,
        if (bloodGroup != null && bloodGroup.isNotEmpty)
          'blood_group': bloodGroup,
        if (organType != null && organType.isNotEmpty) 'organ_type': organType,
        if (city != null && city.isNotEmpty) 'city': city,
        if (state != null && state.isNotEmpty) 'state': state,
        if (urgency != null && urgency.isNotEmpty && urgency != 'ALL')
          'urgency': urgency,
      },
    );

    final parsed = ApiParser.parse<dynamic>(response);

    if (parsed is List) {
      return parsed
          .whereType<Map<String, dynamic>>()
          .map(MatchCandidate.fromJson)
          .toList(growable: false);
    }

    if (parsed is Map<String, dynamic>) {
      final list = parsed['results'] ??
          parsed['candidates'] ??
          parsed['matches'] ??
          const <dynamic>[];
      if (list is List) {
        return list
            .whereType<Map<String, dynamic>>()
            .map(MatchCandidate.fromJson)
            .toList(growable: false);
      }
    }

    return const <MatchCandidate>[];
  }
}

final matchingRepositoryProvider =
    FutureProvider<MatchingRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final demoStore = ref.watch(demoStoreProvider);
  return MatchingRepository(dio, ref, demoStore);
});
