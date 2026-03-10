import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../data/models/match_candidate.dart';
import '../../data/repositories/matching_repository.dart';

class AiMatchingScreen extends ConsumerStatefulWidget {
  const AiMatchingScreen({
    super.key,
    required this.title,
    required this.currentRoute,
    required this.navItems,
    required this.role,
    this.notificationRoute,
  });

  final String title;
  final String currentRoute;
  final List<AppNavItem> navItems;
  final String role;
  final String? notificationRoute;

  @override
  ConsumerState<AiMatchingScreen> createState() => _AiMatchingScreenState();
}

class _AiMatchingScreenState extends ConsumerState<AiMatchingScreen> {
  String _type = 'blood';
  String _urgency = 'ALL';

  final _bloodController = TextEditingController();
  final _organController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();

  bool _loading = false;
  List<MatchCandidate> _candidates = const <MatchCandidate>[];

  static const _bloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
  ];
  static const _organTypes = [
    'Kidney',
    'Liver',
    'Heart',
    'Lung',
    'Pancreas',
    'Cornea'
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _runMatching());
  }

  @override
  void dispose() {
    _bloodController.dispose();
    _organController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _runMatching() async {
    setState(() => _loading = true);
    try {
      final repo = await ref.read(matchingRepositoryProvider.future);
      final result = await repo.fetchCandidates(
        role: widget.role,
        type: _type,
        bloodGroup: _bloodController.text.trim(),
        organType: _organController.text.trim(),
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        urgency: _urgency,
      );
      setState(() => _candidates = result);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                ApiParser.extractMessage(error, fallback: 'Matching failed.'))),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Color _scoreColor(double score) {
    if (score >= 85) return const Color(0xFF0F9D58);
    if (score >= 65) return const Color(0xFFF9AB00);
    return const Color(0xFFDB4437);
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: widget.title,
      navItems: widget.navItems,
      currentRoute: widget.currentRoute,
      notificationRoute: widget.notificationRoute,
      onRefresh: _runMatching,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('AI Matching Filters',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 10),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment<String>(
                          value: 'blood', label: Text('Blood')),
                      ButtonSegment<String>(
                          value: 'organ', label: Text('Organ')),
                    ],
                    selected: {_type},
                    onSelectionChanged: (value) =>
                        setState(() => _type = value.first),
                  ),
                  const SizedBox(height: 10),
                  if (_type == 'blood')
                    DropdownButtonFormField<String>(
                      initialValue: _bloodController.text.isEmpty
                          ? null
                          : _bloodController.text,
                      decoration:
                          const InputDecoration(labelText: 'Blood Group'),
                      items: _bloodGroups
                          .map((item) =>
                              DropdownMenuItem(value: item, child: Text(item)))
                          .toList(),
                      onChanged: (value) => _bloodController.text = value ?? '',
                    )
                  else
                    DropdownButtonFormField<String>(
                      initialValue: _organController.text.isEmpty
                          ? null
                          : _organController.text,
                      decoration:
                          const InputDecoration(labelText: 'Organ Type'),
                      items: _organTypes
                          .map((item) =>
                              DropdownMenuItem(value: item, child: Text(item)))
                          .toList(),
                      onChanged: (value) => _organController.text = value ?? '',
                    ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: _urgency,
                    decoration: const InputDecoration(labelText: 'Urgency'),
                    items: const ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
                        .map((item) =>
                            DropdownMenuItem(value: item, child: Text(item)))
                        .toList(),
                    onChanged: (value) =>
                        setState(() => _urgency = value ?? 'ALL'),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _cityController,
                          decoration: const InputDecoration(labelText: 'City'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _stateController,
                          decoration: const InputDecoration(labelText: 'State'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: _loading ? null : _runMatching,
                    icon: _loading
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.auto_awesome),
                    label: const Text('Run AI Matching'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator()))
          else if (_candidates.isEmpty)
            const EmptyStateWidget(
              title: 'No Candidates',
              message: 'No candidates matched the current filters.',
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _candidates.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, index) {
                final item = _candidates[index];
                final scoreColor = _scoreColor(item.compatibilityScore);

                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(item.name,
                                  style:
                                      Theme.of(context).textTheme.titleMedium),
                            ),
                            StatusChip(label: item.urgency),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Location: ${item.city}, ${item.state}'),
                        Text(
                            'Need: ${item.requestType == 'BLOOD' ? item.bloodGroup ?? '-' : item.organType ?? '-'}'),
                        Text('Availability: ${item.availability}'),
                        const SizedBox(height: 10),
                        Text(
                          'Compatibility: ${item.compatibilityScore.toStringAsFixed(1)}%',
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 5),
                        LinearProgressIndicator(
                          value: (item.compatibilityScore / 100).clamp(0, 1),
                          minHeight: 7,
                          borderRadius: BorderRadius.circular(999),
                          backgroundColor: scoreColor.withValues(alpha: 0.12),
                          valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Confidence: ${item.confidence.toStringAsFixed(1)}%',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: const Color(0xFF5A677A)),
                        ),
                        if (item.explanations.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: item.explanations
                                .map((reason) => Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF1F6FB),
                                        borderRadius:
                                            BorderRadius.circular(999),
                                      ),
                                      child: Text(reason,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall),
                                    ))
                                .toList(),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
