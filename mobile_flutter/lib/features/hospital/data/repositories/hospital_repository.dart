import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../core/models/request_item.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/verification_item.dart';

class HospitalRepository {
  HospitalRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<List<RequestItem>> fetchHospitalRequests() async {
    if (_isDemo) {
      return _demoStore.getHospitalRequests();
    }

    final response = await _dio.get(Endpoints.hospitalRequests);
    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(RequestItem.fromJson)
        .toList(growable: false);
  }

  Future<List<VerificationItem>> fetchPendingVerifications() async {
    if (_isDemo) {
      return _demoStore.getPendingVerifications();
    }

    final response = await _dio.get(Endpoints.pendingVerifications);
    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(VerificationItem.fromJson)
        .toList(growable: false);
  }

  Future<void> updateVerification(
      int donorId, String verificationStatus) async {
    if (_isDemo) {
      _demoStore.updateVerification(donorId, verificationStatus);
      return;
    }

    await _dio.patch(
      Endpoints.updateVerification(donorId),
      data: {'verification_status': verificationStatus},
    );
  }

  Future<RequestItem> updateRequestStatus({
    required int requestId,
    required String status,
    String? notes,
  }) async {
    if (_isDemo) {
      return _demoStore.updateHospitalRequestStatus(
          requestId: requestId, status: status, notes: notes);
    }

    final response = await _dio.patch(
      Endpoints.updateRequestStatus(requestId),
      data: {
        'status': status,
        if (notes != null) 'notes': notes,
      },
    );

    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return RequestItem.fromJson(data);
  }

  Future<void> runMatching(int requestId) async {
    if (_isDemo) {
      _demoStore.runMatching(requestId);
      return;
    }

    await _dio.post(Endpoints.runMatching, data: {'request_id': requestId});
  }
}

final hospitalRepositoryProvider =
    FutureProvider<HospitalRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final store = ref.watch(demoStoreProvider);
  return HospitalRepository(dio, ref, store);
});
