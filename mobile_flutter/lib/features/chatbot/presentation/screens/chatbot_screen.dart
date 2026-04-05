import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widgets/app_scaffold.dart';
import '../../../../services/api_parser.dart';
import '../../data/repositories/chatbot_repository.dart';

class ChatbotScreen extends ConsumerStatefulWidget {
  const ChatbotScreen({
    super.key,
    required this.title,
    required this.currentRoute,
    required this.navItems,
    this.notificationRoute,
  });

  final String title;
  final String currentRoute;
  final List<AppNavItem> navItems;
  final String? notificationRoute;

  @override
  ConsumerState<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _Message {
  const _Message({
    required this.text,
    required this.isUser,
    required this.createdAt,
    this.matchedQuestion,
    this.confidence,
    this.suggestedQuestions = const <String>[],
  });

  final String text;
  final bool isUser;
  final DateTime createdAt;
  final String? matchedQuestion;
  final double? confidence;
  final List<String> suggestedQuestions;
}

class _ChatbotScreenState extends ConsumerState<ChatbotScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();

  bool _sending = false;
  bool _loadingQuestions = true;
  List<String> _quickQuestions = const <String>[];

  List<_Message> _messages = [
    _Message(
      text:
          'Hello. I can help with eligibility, emergency workflow, AI matching, notifications, and analytics interpretation.',
      isUser: false,
      createdAt: DateTime(2024, 1, 1),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadQuickQuestions();
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadQuickQuestions() async {
    setState(() => _loadingQuestions = true);

    try {
      final repo = await ref.read(chatbotRepositoryProvider.future);
      final questions = await repo.fetchQuestions();
      if (!mounted) return;
      setState(() => _quickQuestions = questions);
    } catch (_) {
      if (!mounted) return;
      setState(() => _quickQuestions = const <String>[]);
    } finally {
      if (mounted) {
        setState(() => _loadingQuestions = false);
      }
    }
  }

  void _scrollToBottom({bool animate = true}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }

      final target = _scrollController.position.maxScrollExtent + 72;
      if (animate) {
        _scrollController.animateTo(
          target,
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOut,
        );
      } else {
        _scrollController.jumpTo(target);
      }
    });
  }

  Future<void> _send([String? preset]) async {
    final text = (preset ?? _inputController.text).trim();
    if (text.isEmpty || _sending) return;

    setState(() {
      _sending = true;
      _messages = [
        ..._messages,
        _Message(text: text, isUser: true, createdAt: DateTime.now()),
      ];
      _inputController.clear();
    });
    _scrollToBottom();

    try {
      final repo = await ref.read(chatbotRepositoryProvider.future);
      final answer = await repo.ask(text);

      if (!mounted) return;
      setState(() {
        _messages = [
          ..._messages,
          _Message(
            text: answer.response,
            isUser: false,
            createdAt: DateTime.now(),
            matchedQuestion: answer.matchedQuestion,
            confidence: answer.confidence,
            suggestedQuestions: answer.suggestedQuestions,
          ),
        ];
      });
      _scrollToBottom();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Chatbot request failed.'))),
      );
    } finally {
      if (mounted) {
        setState(() => _sending = false);
      }
    }
  }

  Widget _messageBubble(_Message msg) {
    final align = msg.isUser ? Alignment.centerRight : Alignment.centerLeft;
    final bubbleColor = msg.isUser
        ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.16)
        : Theme.of(context).cardColor.withValues(alpha: 0.7);

    return Align(
      alignment: align,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: bubbleColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: msg.isUser
                  ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.4)
                  : Theme.of(context).dividerColor,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(msg.text),
              if (!msg.isUser && msg.matchedQuestion != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Matched intent: ${msg.matchedQuestion}${msg.confidence != null ? ' | Confidence: ${(msg.confidence! * 100).round()}%' : ''}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.color
                            ?.withValues(alpha: 0.75),
                      ),
                ),
              ],
              if (!msg.isUser && msg.suggestedQuestions.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: msg.suggestedQuestions.take(3).map((q) {
                    return ActionChip(
                      label: Text(q),
                      onPressed: _sending ? null : () => _send(q),
                    );
                  }).toList(growable: false),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: widget.title,
      navItems: widget.navItems,
      currentRoute: widget.currentRoute,
      notificationRoute: widget.notificationRoute,
      scrollableBody: false,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ask AI Assistant',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  if (_loadingQuestions)
                    const LinearProgressIndicator(minHeight: 3)
                  else if (_quickQuestions.isNotEmpty)
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 160),
                      child: SingleChildScrollView(
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _quickQuestions.map((item) {
                            return ActionChip(
                              label: Text(item),
                              onPressed: _sending ? null : () => _send(item),
                            );
                          }).toList(growable: false),
                        ),
                      ),
                    )
                  else
                    Text(
                      'Quick questions unavailable. You can type your own message below.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Card(
              child: ListView.separated(
                controller: _scrollController,
                padding: const EdgeInsets.all(12),
                itemBuilder: (_, index) {
                  final msg = _messages[index];
                  return _messageBubble(msg);
                },
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemCount: _messages.length,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _inputController,
                  minLines: 1,
                  maxLines: 3,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _send(),
                  decoration: const InputDecoration(
                    labelText: 'Type your question',
                    prefixIcon: Icon(Icons.chat_bubble_outline),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton.icon(
                onPressed: _sending ? null : _send,
                icon: _sending
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.send),
                label: const Text('Send'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
