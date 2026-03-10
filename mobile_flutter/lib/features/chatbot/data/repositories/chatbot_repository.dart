import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/demo/demo_mode.dart';
import '../../../../core/demo/demo_store.dart';
import '../../../../services/api_parser.dart';
import '../../../../services/endpoints.dart';
import '../../../../services/service_providers.dart';
import '../models/chatbot_reply.dart';

class ChatbotRepository {
  ChatbotRepository(this._dio, this._ref, this._demoStore);

  final Dio _dio;
  final Ref _ref;
  final DemoStore _demoStore;

  bool get _isDemo => _ref.read(demoSessionProvider).enabled;

  static const List<String> _fallbackQuestions = [
    'Who can donate blood?',
    'How often can I donate blood?',
    'How does AI matching work in this system?',
    'What is an emergency request?',
    'Can I donate organs and blood both?',
    'How can hospitals verify donor profiles?',
    'What does match response status mean?',
    'How do notifications help?',
    'How can admin use analytics dashboard?',
    'Is AI output final medical advice?',
  ];

  Future<List<String>> fetchQuestions() async {
    if (_isDemo) {
      return _fallbackQuestions;
    }

    final response = await _dio.get(Endpoints.chatbotQuestions);
    final parsed = ApiParser.parse<dynamic>(response);

    if (parsed is Map<String, dynamic>) {
      final questions = parsed['questions'];
      if (questions is List) {
        return questions
            .map((item) => item.toString())
            .where((item) => item.isNotEmpty)
            .toList(growable: false);
      }
    }

    return _fallbackQuestions;
  }

  Future<ChatbotReply> ask(String question) async {
    if (_isDemo) {
      final response = _demoStore.askChatbot(question);
      return ChatbotReply(
        response: response,
        confidence: 0.72,
        suggestedQuestions: _fallbackQuestions.take(3).toList(growable: false),
      );
    }

    final response = await _dio.post(
      Endpoints.chatbotAsk,
      data: {'message': question},
    );

    final parsed = ApiParser.parse<dynamic>(response);

    if (parsed is Map<String, dynamic>) {
      return ChatbotReply.fromJson(parsed);
    }

    return ChatbotReply(
      response: parsed.toString(),
      suggestedQuestions: _fallbackQuestions.take(3).toList(growable: false),
    );
  }
}

final chatbotRepositoryProvider =
    FutureProvider<ChatbotRepository>((ref) async {
  final dio = await ref.watch(dioProvider.future);
  final demoStore = ref.watch(demoStoreProvider);
  return ChatbotRepository(dio, ref, demoStore);
});
