import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/analytics_snapshot.dart';

class AnalyticsRepository {
  AnalyticsRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<AnalyticsSnapshot> fetchSnapshot() async {
    if (_isDemo) {
      return _demoStore.getAnalyticsSnapshot();
    }

    final response = await _dio.get(Endpoints.adminAnalytics);
    final parsed = ApiParser.parse<Map<String, dynamic>>(response);
    return AnalyticsSnapshot.fromJson(parsed);
  }
}

final analyticsRepositoryProvider =
    FutureProvider<AnalyticsRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final demoStore = ref.watch(demoStoreProvider);
  return AnalyticsRepository(dio, ref, demoStore);
});

final analyticsSnapshotProvider =
    FutureProvider.autoDispose<AnalyticsSnapshot>((ref) async {
  final repo = await ref.watch(analyticsRepositoryProvider.future);
  return repo.fetchSnapshot();
});
