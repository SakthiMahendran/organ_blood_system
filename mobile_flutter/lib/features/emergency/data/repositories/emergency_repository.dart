import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../core/models/request_item.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';

class EmergencyRepository {
  EmergencyRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<List<RequestItem>> fetchEmergencyRequests(
      {required String role}) async {
    if (_isDemo) {
      return _demoStore.getEmergencyRequests(role: role);
    }

    final response = await _dio.get(
      Endpoints.emergencyRequests,
      queryParameters: {'role': role},
    );

    final parsed = ApiParser.parse<dynamic>(response);

    if (parsed is List) {
      return parsed
          .whereType<Map<String, dynamic>>()
          .map(RequestItem.fromJson)
          .toList(growable: false);
    }

    if (parsed is Map<String, dynamic>) {
      final list = parsed['results'] ?? parsed['requests'] ?? const <dynamic>[];
      if (list is List) {
        return list
            .whereType<Map<String, dynamic>>()
            .map(RequestItem.fromJson)
            .toList(growable: false);
      }
    }

    return const <RequestItem>[];
  }

  Future<RequestItem> createEmergencyRequest(
      Map<String, dynamic> payload) async {
    if (_isDemo) {
      return _demoStore.createEmergencyRequest(payload);
    }

    final response =
        await _dio.post(Endpoints.emergencyRequests, data: payload);
    final parsed = ApiParser.parse<Map<String, dynamic>>(response);
    return RequestItem.fromJson(parsed);
  }
}

final emergencyRepositoryProvider =
    FutureProvider<EmergencyRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final demoStore = ref.watch(demoStoreProvider);
  return EmergencyRepository(dio, ref, demoStore);
});
