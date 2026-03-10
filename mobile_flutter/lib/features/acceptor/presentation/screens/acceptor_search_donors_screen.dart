import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../data/models/donor_search_item.dart';
import '../../data/repositories/acceptor_repository.dart';

class AcceptorSearchDonorsScreen extends ConsumerStatefulWidget {
  const AcceptorSearchDonorsScreen({super.key});

  @override
  ConsumerState<AcceptorSearchDonorsScreen> createState() =>
      _AcceptorSearchDonorsScreenState();
}

class _AcceptorSearchDonorsScreenState
    extends ConsumerState<AcceptorSearchDonorsScreen> {
  String _type = 'blood';
  String _urgency = 'ALL';
  bool _onlyAvailable = true;

  final _bloodGroupController = TextEditingController();
  final _organController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();

  bool _loading = false;
  List<DonorSearchItem> _results = const [];

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
  void dispose() {
    _bloodGroupController.dispose();
    _organController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    setState(() => _loading = true);
    try {
      final repo = await ref.read(acceptorRepositoryProvider.future);
      final data = await repo.searchDonors(
        type: _type,
        bloodGroup: _bloodGroupController.text.trim(),
        organ: _organController.text.trim(),
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        onlyAvailable: _onlyAvailable,
        urgency: _urgency,
      );

      data.sort((a, b) {
        final aScore = a.compatibilityScore ?? 0;
        final bScore = b.compatibilityScore ?? 0;
        return bScore.compareTo(aScore);
      });

      setState(() => _results = data);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiParser.extractMessage(error))));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Search Donors',
      navItems: AppNavItems.acceptor,
      currentRoute: RoutePaths.acceptorSearchDonors,
      notificationRoute: RoutePaths.acceptorNotifications,
      onRefresh: _search,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                      initialValue: _bloodGroupController.text.isEmpty
                          ? null
                          : _bloodGroupController.text,
                      decoration:
                          const InputDecoration(labelText: 'Blood Group'),
                      items: _bloodGroups
                          .map(
                              (e) => DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                      onChanged: (value) =>
                          _bloodGroupController.text = value ?? '',
                    )
                  else
                    DropdownButtonFormField<String>(
                      initialValue: _organController.text.isEmpty
                          ? null
                          : _organController.text,
                      decoration:
                          const InputDecoration(labelText: 'Organ Type'),
                      items: _organTypes
                          .map(
                              (e) => DropdownMenuItem(value: e, child: Text(e)))
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
                  SwitchListTile(
                    title: const Text('Only Available Donors'),
                    contentPadding: EdgeInsets.zero,
                    value: _onlyAvailable,
                    onChanged: (value) =>
                        setState(() => _onlyAvailable = value),
                  ),
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
                  const SizedBox(height: 10),
                  FilledButton.icon(
                    onPressed: _loading ? null : _search,
                    icon: _loading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.search),
                    label: const Text('Run Smart Search'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (_results.isEmpty)
            const EmptyStateWidget(
                title: 'No Donors',
                message: 'Try different filters and urgency settings.')
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _results.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, index) {
                final donor = _results[index];
                final score = donor.compatibilityScore ?? 0;
                final confidence = donor.confidence ?? 0;

                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(donor.name,
                                  style:
                                      Theme.of(context).textTheme.titleMedium),
                            ),
                            StatusChip(label: donor.availabilityStatus),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Location: ${donor.city}, ${donor.state}'),
                        Text('Blood: ${donor.bloodGroup ?? '-'}'),
                        Text(
                            'Organs: ${donor.organTypes.isEmpty ? '-' : donor.organTypes.join(', ')}'),
                        const SizedBox(height: 8),
                        if (score > 0) ...[
                          Text('Compatibility: ${score.toStringAsFixed(1)}%'),
                          const SizedBox(height: 4),
                          LinearProgressIndicator(
                            value: (score / 100).clamp(0, 1),
                            minHeight: 7,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Confidence: ${confidence.toStringAsFixed(1)}%',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: const Color(0xFF5A677A)),
                          ),
                        ],
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text(
                                      'Contact option depends on backend permission fields.')),
                            );
                          },
                          icon: const Icon(Icons.phone_outlined),
                          label: const Text('Contact Option'),
                        ),
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
