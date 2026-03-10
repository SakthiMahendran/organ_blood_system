import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/admin_hospital_item.dart';
import '../models/admin_summary.dart';
import '../models/admin_user_item.dart';
import '../models/audit_log_item.dart';

class AdminRepository {
  AdminRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<AdminSummary> fetchSummary() async {
    if (_isDemo) {
      return _demoStore.getSummary();
    }

    final response = await _dio.get(Endpoints.adminSummary);
    final data = ApiParser.parse<Map<String, dynamic>>(response);
    return AdminSummary.fromJson(data);
  }

  Future<List<AdminUserItem>> fetchUsers() async {
    if (_isDemo) {
      return _demoStore.getUsers();
    }

    final response = await _dio.get(Endpoints.adminUsers);
    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(AdminUserItem.fromJson)
        .toList(growable: false);
  }

  Future<void> updateUserStatus(
      {required int userId, required bool isActive}) async {
    if (_isDemo) {
      _demoStore.updateUserStatus(userId: userId, isActive: isActive);
      return;
    }

    await _dio.patch(
      Endpoints.adminUpdateUser(userId),
      data: {'is_active': isActive},
    );
  }

  Future<List<AdminHospitalItem>> fetchHospitals() async {
    if (_isDemo) {
      return _demoStore.getHospitals();
    }

    final response = await _dio.get(Endpoints.adminHospitals);
    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(AdminHospitalItem.fromJson)
        .toList(growable: false);
  }

  Future<void> updateHospitalStatus(
      {required int hospitalId, required String approvalStatus}) async {
    if (_isDemo) {
      _demoStore.updateHospitalStatus(
          hospitalId: hospitalId, approvalStatus: approvalStatus);
      return;
    }

    await _dio.patch(
      Endpoints.adminUpdateHospital(hospitalId),
      data: {'approval_status': approvalStatus},
    );
  }

  Future<List<AuditLogItem>> fetchAuditLogs(
      {String? actorQuery, String? action}) async {
    if (_isDemo) {
      return _demoStore.getAuditLogs(actorUserId: actorQuery, action: action);
    }

    final response = await _dio.get(
      Endpoints.adminAudit,
      queryParameters: {
        if (actorQuery != null && actorQuery.isNotEmpty) 'actor': actorQuery,
        if (action != null && action.isNotEmpty) 'action': action,
      },
    );

    final data = ApiParser.parse<List<dynamic>>(response);
    return data
        .whereType<Map<String, dynamic>>()
        .map(AuditLogItem.fromJson)
        .toList(growable: false);
  }
}

final adminRepositoryProvider = FutureProvider<AdminRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final store = ref.watch(demoStoreProvider);
  return AdminRepository(dio, ref, store);
});
