import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/inventory_item.dart';

class InventoryRepository {
  InventoryRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<List<InventoryItem>> fetchInventory() async {
    if (_isDemo) {
      return _demoStore.getInventory();
    }

    final response = await _dio.get(Endpoints.adminInventory);
    final parsed = ApiParser.parse<dynamic>(response);

    if (parsed is List) {
      return parsed
          .whereType<Map<String, dynamic>>()
          .map(InventoryItem.fromJson)
          .toList(growable: false);
    }

    if (parsed is Map<String, dynamic>) {
      final list = parsed['results'] ?? parsed['items'] ?? const <dynamic>[];
      if (list is List) {
        return list
            .whereType<Map<String, dynamic>>()
            .map(InventoryItem.fromJson)
            .toList(growable: false);
      }
    }

    return const <InventoryItem>[];
  }

  Future<InventoryItem> updateInventory(
      {required String bloodGroup, required int units, int? threshold}) async {
    if (_isDemo) {
      return _demoStore.updateInventory(
          bloodGroup: bloodGroup, units: units, threshold: threshold);
    }

    final response = await _dio.patch(
      Endpoints.adminInventoryByGroup(bloodGroup),
      data: {
        'units': units,
        if (threshold != null) 'threshold': threshold,
      },
    );

    final parsed = ApiParser.parse<Map<String, dynamic>>(response);
    return InventoryItem.fromJson(parsed);
  }
}

final inventoryRepositoryProvider =
    FutureProvider<InventoryRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final demoStore = ref.watch(demoStoreProvider);
  return InventoryRepository(dio, ref, demoStore);
});
