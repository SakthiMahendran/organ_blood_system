import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../core/models/request_item.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/donor_profile.dart';
import '../models/match_item.dart';

class DonorRepository {
  DonorRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<DonorProfile?> fetchProfile() async {
    if (_isDemo) {
      return _demoStore.getDonorProfile();
    }

    try {
      final response = await _dio.get(Endpoints.donorProfile);
      final data = ApiParser.parse<Map<String, dynamic>>(response);
      return DonorProfile.fromJson(data);
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  Future<DonorProfile> upsertProfile(Map<String, dynamic> payload) async {
    if (_isDemo) {
      return _demoStore.upsertDonorProfile(payload);
    }

    final response = await _dio.put(Endpoints.donorProfile, data: payload);
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return DonorProfile.fromJson(data);
  }

  Future<DonorProfile> updateAvailability(String availabilityStatus) async {
    if (_isDemo) {
      return _demoStore.updateDonorAvailability(availabilityStatus);
    }

    final response = await _dio.patch(
      Endpoints.donorAvailability,
      data: {'availability_status': availabilityStatus},
    );
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return DonorProfile.fromJson(data);
  }

  Future<List<MatchItem>> fetchMatches() async {
    if (_isDemo) {
      return _demoStore.getDonorMatches();
    }

    final response = await _dio.get(Endpoints.donorMatches);
    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(MatchItem.fromJson)
        .toList(growable: false);
  }

  Future<void> respondToMatch(int matchId, String responseValue) async {
    if (_isDemo) {
      _demoStore.respondToMatch(matchId, responseValue);
      return;
    }

    await _dio.post(
      Endpoints.donorMatchRespond(matchId),
      data: {'response': responseValue},
    );
  }

  Future<RequestItem?> fetchRequest(int requestId) async {
    if (_isDemo) {
      return _demoStore.getRequestById(requestId);
    }

    try {
      final response = await _dio.get(Endpoints.requestDetail(requestId));
      final data = ApiParser.parse<Map<String, dynamic>>(response);
      return RequestItem.fromJson(data);
    } catch (_) {
      return null;
    }
  }
}

final donorRepositoryProvider = FutureProvider<DonorRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final store = ref.watch(demoStoreProvider);
  return DonorRepository(dio, ref, store);
});
