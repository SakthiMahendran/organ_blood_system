import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../core/utils/api_exception.dart';
import 'endpoints.dart';
import 'token_storage.dart';

class DioClient {
  DioClient({
    required TokenStorage tokenStorage,
    required void Function() onUnauthorized,
  })  : _tokenStorage = tokenStorage,
        _onUnauthorized = onUnauthorized,
        _refreshDio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: AppConfig.connectTimeout,
            receiveTimeout: AppConfig.receiveTimeout,
          ),
        );

  final TokenStorage _tokenStorage;
  final void Function() _onUnauthorized;
  final Dio _refreshDio;

  bool _isRefreshing = false;

  Future<Dio> create() async {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: const {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          final requestOptions = error.requestOptions;
          final path = requestOptions.path;

          final isAuthPath = path.contains(Endpoints.login) ||
              path.contains(Endpoints.register) ||
              path.contains(Endpoints.refresh);

          if (statusCode != 401 ||
              requestOptions.extra['retried'] == true ||
              isAuthPath) {
            handler.next(error);
            return;
          }

          final refreshToken = await _tokenStorage.getRefreshToken();
          if (refreshToken == null || refreshToken.isEmpty) {
            _onUnauthorized();
            handler.next(error);
            return;
          }

          if (_isRefreshing) {
            handler.next(error);
            return;
          }

          _isRefreshing = true;

          try {
            final refreshResponse = await _refreshDio.post(
              Endpoints.refresh,
              data: {'refresh': refreshToken},
            );

            final dynamic body = refreshResponse.data;
            String? newAccess;
            String? newRefresh;

            if (body is Map<String, dynamic>) {
              newAccess = body['access']?.toString() ??
                  body['data']?['access']?.toString();
              newRefresh = body['refresh']?.toString() ??
                  body['data']?['refresh']?.toString() ??
                  refreshToken;
            }

            if (newAccess == null || newAccess.isEmpty) {
              throw ApiException('Session refresh failed.',
                  statusCode: refreshResponse.statusCode);
            }

            await _tokenStorage.saveTokens(
                accessToken: newAccess, refreshToken: newRefresh);

            requestOptions.headers['Authorization'] = 'Bearer $newAccess';
            requestOptions.extra['retried'] = true;

            final retryResponse = await dio.fetch(requestOptions);
            handler.resolve(retryResponse);
          } catch (_) {
            await _tokenStorage.clear();
            _onUnauthorized();
            handler.next(error);
          } finally {
            _isRefreshing = false;
          }
        },
      ),
    );

    return dio;
  }
}
