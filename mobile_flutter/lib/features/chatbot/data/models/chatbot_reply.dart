class ChatbotReply {
  const ChatbotReply({
    required this.response,
    this.matchedQuestion,
    this.confidence,
    this.suggestedQuestions = const <String>[],
  });

  final String response;
  final String? matchedQuestion;
  final double? confidence;
  final List<String> suggestedQuestions;

  factory ChatbotReply.fromJson(Map<String, dynamic> json) {
    final suggestionsRaw = json['suggested_questions'];
    final suggestions = suggestionsRaw is List
        ? suggestionsRaw
            .map((item) => item.toString())
            .where((item) => item.isNotEmpty)
            .toList(growable: false)
        : const <String>[];

    return ChatbotReply(
      response: (json['response'] ??
              json['answer'] ??
              json['message'] ??
              'No response available.')
          .toString(),
      matchedQuestion: json['matched_question']?.toString(),
      confidence: (json['confidence'] as num?)?.toDouble(),
      suggestedQuestions: suggestions,
    );
  }
}
