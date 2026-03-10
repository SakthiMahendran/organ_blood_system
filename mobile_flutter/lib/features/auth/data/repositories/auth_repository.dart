import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/api_exception.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../../../../services/token_storage.dart';
import '../models/auth_tokens.dart';
import '../models/auth_user.dart';

class AuthRepository {
  AuthRepository({
    required Dio dio,
    required Dio publicDio,
    required TokenStorage tokenStorage,
  })  : _dio = dio,
        _publicDio = publicDio,
        _tokenStorage = tokenStorage;

  final Dio _dio;
  final Dio _publicDio;
  final TokenStorage _tokenStorage;

  Future<(AuthUser user, AuthTokens tokens)> login({
    required String identifier,
    required String password,
  }) async {
    final response = await _publicDio.post(
      Endpoints.login,
      data: {
        'identifier': identifier,
        'password': password,
      },
    );

    final payload = ApiParser.parse<Map<String, dynamic>>(response);
    return _readAuthPayload(payload);
  }

  Future<(AuthUser user, AuthTokens tokens)> register({
    required String username,
    required String email,
    required String phone,
    required String password,
    required String address,
    required String city,
    required String state,
    required String role,
  }) async {
    final response = await _publicDio.post(
      Endpoints.register,
      data: {
        'username': username,
        'email': email,
        'phone': phone,
        'password': password,
        'address': address,
        'city': city,
        'state': state,
        'location': '$city, $state',
        'user_type': role,
      },
    );

    final payload = ApiParser.parse<Map<String, dynamic>>(response);
    return _readAuthPayload(payload);
  }

  Future<Map<String, dynamic>> registerHospital({
    required String hospitalName,
    required String registrationNumber,
    required String institutionType,
    required String email,
    required String phone,
    required String addressLine1,
    String? addressLine2,
    required String city,
    required String state,
    required String pincode,
    required String contactPersonName,
    required String contactPersonRole,
    required String contactPersonPhone,
    required bool bloodBankAvailable,
    required bool organTransplantSupport,
    required bool emergencyResponse,
    required List<String> supportedBloodGroups,
    required String password,
    required String confirmPassword,
    String? licenseDocumentName,
    String? hospitalIdProofName,
  }) async {
    final response = await _publicDio.post(
      Endpoints.registerHospital,
      data: {
        'role': 'hospital',
        'hospital_name': hospitalName,
        'registration_number': registrationNumber,
        'institution_type': institutionType,
        'email': email,
        'phone': phone,
        'address_line_1': addressLine1,
        'address_line_2': addressLine2,
        'city': city,
        'state': state,
        'pincode': pincode,
        'contact_person_name': contactPersonName,
        'contact_person_role': contactPersonRole,
        'contact_person_phone': contactPersonPhone,
        'blood_bank_available': bloodBankAvailable,
        'organ_transplant_support': organTransplantSupport,
        'emergency_response': emergencyResponse,
        'supported_blood_groups': supportedBloodGroups,
        'password': password,
        'confirm_password': confirmPassword,
        'license_document_name': licenseDocumentName,
        'hospital_id_proof_name': hospitalIdProofName,
      },
    );

    final payload = ApiParser.parse<Map<String, dynamic>>(response);
    return payload;
  }

  Future<AuthUser> me() async {
    final response = await _dio.get(Endpoints.me);
    final payload = ApiParser.parse<Map<String, dynamic>>(response);
    return AuthUser.fromJson(payload);
  }

  Future<void> logout() async {
    final refreshToken = await _tokenStorage.getRefreshToken();
    try {
      await _dio.post(
        Endpoints.logout,
        data: refreshToken != null ? {'refresh': refreshToken} : {},
      );
    } catch (_) {
      // Ignore logout request failures and clear local state anyway.
    }
  }

  Future<void> persistTokens(AuthTokens tokens) async {
    await _tokenStorage.saveTokens(
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    );
  }

  Future<void> clearTokens() => _tokenStorage.clear();

  Future<bool> hasSession() async {
    final access = await _tokenStorage.getAccessToken();
    return access != null && access.isNotEmpty;
  }

  Future<String?> getAccessToken() => _tokenStorage.getAccessToken();
  Future<String?> getRefreshToken() => _tokenStorage.getRefreshToken();

  (AuthUser user, AuthTokens tokens) _readAuthPayload(
      Map<String, dynamic> payload) {
    final userJson = payload['user'];
    final tokensJson = payload['tokens'];

    if (userJson is! Map<String, dynamic> ||
        tokensJson is! Map<String, dynamic>) {
      throw ApiException('Invalid auth response payload.');
    }

    final access = tokensJson['access']?.toString();
    if (access == null || access.isEmpty) {
      throw ApiException('Access token is missing in auth response.');
    }

    return (
      AuthUser.fromJson(userJson),
      AuthTokens(
        accessToken: access,
        refreshToken: tokensJson['refresh']?.toString(),
      )
    );
  }
}

final authRepositoryProvider = FutureProvider<AuthRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final publicDio = ref.watch(publicDioProvider);
  final storage = ref.watch(tokenStorageProvider);

  return AuthRepository(dio: dio, publicDio: publicDio, tokenStorage: storage);
});
