import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../core/models/request_item.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/donor_search_item.dart';

class AcceptorRepository {
  AcceptorRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<List<RequestItem>> fetchMyRequests() async {
    if (_isDemo) {
      return _demoStore.getAcceptorRequests();
    }

    final response = await _dio.get(Endpoints.myRequests);
    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(RequestItem.fromJson)
        .toList(growable: false);
  }

  Future<RequestItem> createBloodRequest(Map<String, dynamic> payload) async {
    if (_isDemo) {
      return _demoStore.createBloodRequest(payload);
    }

    final response =
        await _dio.post(Endpoints.createBloodRequest, data: payload);
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return RequestItem.fromJson(data);
  }

  Future<RequestItem> createOrganRequest(Map<String, dynamic> payload) async {
    if (_isDemo) {
      return _demoStore.createOrganRequest(payload);
    }

    final response =
        await _dio.post(Endpoints.createOrganRequest, data: payload);
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return RequestItem.fromJson(data);
  }

  Future<RequestItem> updateRequest(
      int requestId, Map<String, dynamic> payload) async {
    if (_isDemo) {
      return _demoStore.updateRequest(requestId, payload);
    }

    final response =
        await _dio.patch(Endpoints.requestDetail(requestId), data: payload);
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return RequestItem.fromJson(data);
  }

  Future<RequestItem> cancelRequest(int requestId) async {
    if (_isDemo) {
      return _demoStore.cancelRequest(requestId);
    }

    final response = await _dio.patch(
      Endpoints.requestDetail(requestId),
      data: const {'status': 'CANCELLED'},
    );
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return RequestItem.fromJson(data);
  }

  Future<List<DonorSearchItem>> searchDonors({
    required String type,
    String? bloodGroup,
    String? organ,
    String? city,
    String? state,
    bool onlyAvailable = false,
    String? urgency,
  }) async {
    if (_isDemo) {
      return _demoStore.searchDonors(
        type: type,
        bloodGroup: bloodGroup,
        organ: organ,
        city: city,
        state: state,
        onlyAvailable: onlyAvailable,
        urgency: urgency,
      );
    }

    final response = await _dio.get(
      Endpoints.searchDonors,
      queryParameters: {
        'type': type,
        if (bloodGroup != null && bloodGroup.isNotEmpty)
          'blood_group': bloodGroup,
        if (organ != null && organ.isNotEmpty) 'organ': organ,
        if (city != null && city.isNotEmpty) 'city': city,
        if (state != null && state.isNotEmpty) 'state': state,
        if (onlyAvailable) 'availability_status': 'AVAILABLE',
        if (urgency != null && urgency.isNotEmpty && urgency != 'ALL')
          'urgency': urgency,
      },
    );

    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(DonorSearchItem.fromJson)
        .toList(growable: false);
  }
}

final acceptorRepositoryProvider =
    FutureProvider<AcceptorRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final store = ref.watch(demoStoreProvider);
  return AcceptorRepository(dio, ref, store);
});
