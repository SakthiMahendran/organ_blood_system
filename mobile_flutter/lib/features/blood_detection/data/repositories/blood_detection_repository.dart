import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/blood_detection_result.dart';

class BloodDetectionRepository {
  BloodDetectionRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  Future<BloodDetectionResult> runPrototype({
    required String source,
    XFile? imageFile,
  }) async {
    if (_isDemo) {
      return _demoStore.detectBloodGroup(source: imageFile?.name ?? source);
    }

    Response<dynamic> response;

    if (imageFile != null) {
      final bytes = await imageFile.readAsBytes();
      final formData = FormData.fromMap({
        'source': source,
        'image': MultipartFile.fromBytes(bytes, filename: imageFile.name),
      });

      response = await _dio.post(
        Endpoints.bloodGroupDetect,
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
    } else {
      response = await _dio.post(
        Endpoints.bloodGroupDetect,
        data: {
          'source': source,
          'prototype': true,
        },
      );
    }

    final parsed = ApiParser.parse<dynamic>(response);
    if (parsed is Map<String, dynamic>) {
      return BloodDetectionResult.fromJson(parsed);
    }

    return BloodDetectionResult(
      bloodGroup: parsed.toString(),
      confidence: 0,
      summary: 'Prototype prediction generated.',
      disclaimer: 'Prototype output only. Do not use for medical decisions.',
      inputType: imageFile != null ? 'image' : 'text',
      sourceLabel: imageFile?.name ?? source,
    );
  }
}

final bloodDetectionRepositoryProvider =
    FutureProvider<BloodDetectionRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final demoStore = ref.watch(demoStoreProvider);
  return BloodDetectionRepository(dio, ref, demoStore);
});
