import 'package:dio/dio.dart';

import '../core/utils/api_exception.dart';

class ApiParser {
  const ApiParser._();

  static T parse<T>(Response<dynamic> response) {
    final dynamic data = response.data;

    if (data is Map<String, dynamic>) {
      final success = data['success'];
      if (success == false) {
        final error = data['error'];
        final message = error is Map<String, dynamic>
            ? (error['message']?.toString() ?? 'Request failed.')
            : 'Request failed.';
        throw ApiException(message, statusCode: response.statusCode);
      }

      if (data.containsKey('data')) {
        return data['data'] as T;
      }
    }

    return data as T;
  }

  static String extractMessage(Object error,
      {String fallback = 'Something went wrong.'}) {
    if (error is ApiException) {
      return error.message;
    }
    if (error is DioException) {
      final body = error.response?.data;
      if (body is Map<String, dynamic>) {
        final wrappedError = body['error'];
        if (wrappedError is Map<String, dynamic> &&
            wrappedError['message'] != null) {
          return wrappedError['message'].toString();
        }
        if (body['message'] != null) {
          return body['message'].toString();
        }
      }
      return error.message ?? fallback;
    }
    return fallback;
  }
}
