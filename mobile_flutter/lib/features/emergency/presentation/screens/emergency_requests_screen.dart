import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/models/request_item.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_chip.dart';
import '../../../../services/api_parser.dart';
import '../../data/repositories/emergency_repository.dart';

class EmergencyRequestsScreen extends ConsumerStatefulWidget {
  const EmergencyRequestsScreen({
    super.key,
    required this.title,
    required this.currentRoute,
    required this.navItems,
    required this.role,
    required this.canCreate,
    this.notificationRoute,
  });

  final String title;
  final String currentRoute;
  final List<AppNavItem> navItems;
  final String role;
  final bool canCreate;
  final String? notificationRoute;

  @override
  ConsumerState<EmergencyRequestsScreen> createState() =>
      _EmergencyRequestsScreenState();
}

class _EmergencyRequestsScreenState
    extends ConsumerState<EmergencyRequestsScreen> {
  String _type = 'BLOOD';
  final _bloodController = TextEditingController(text: 'O+');
  final _organController = TextEditingController(text: 'Kidney');
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _notesController = TextEditingController();

  bool _loading = false;
  bool _submitting = false;
  List<RequestItem> _items = const <RequestItem>[];

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
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _bloodController.dispose();
    _organController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final repo = await ref.read(emergencyRepositoryProvider.future);
      final data = await repo.fetchEmergencyRequests(role: widget.role);
      setState(() => _items = data);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Failed to load emergency list.'))),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _createEmergency() async {
    if (_cityController.text.trim().isEmpty ||
        _stateController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('City and state are required.')));
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Emergency Request'),
        content: const Text(
            'This will create a high-priority emergency request immediately.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          FilledButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Confirm')),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _submitting = true);
    try {
      final repo = await ref.read(emergencyRepositoryProvider.future);
      await repo.createEmergencyRequest({
        'request_type': _type,
        'blood_group': _type == 'BLOOD' ? _bloodController.text.trim() : null,
        'organ_type': _type == 'ORGAN' ? _organController.text.trim() : null,
        'urgency': 'EMERGENCY',
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
        'notes': _notesController.text.trim(),
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Emergency request submitted.')));
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Emergency submission failed.'))),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: widget.title,
      navItems: widget.navItems,
      currentRoute: widget.currentRoute,
      notificationRoute: widget.notificationRoute,
      onRefresh: _load,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.canCreate)
            Card(
              color: const Color(0xFFFFF2F2),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('One-Tap Emergency',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 10),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment<String>(
                            value: 'BLOOD', label: Text('Blood')),
                        ButtonSegment<String>(
                            value: 'ORGAN', label: Text('Organ')),
                      ],
                      selected: {_type},
                      onSelectionChanged: (value) =>
                          setState(() => _type = value.first),
                    ),
                    const SizedBox(height: 10),
                    if (_type == 'BLOOD')
                      DropdownButtonFormField<String>(
                        initialValue: _bloodController.text,
                        decoration:
                            const InputDecoration(labelText: 'Blood Group'),
                        items: _bloodGroups
                            .map((item) => DropdownMenuItem(
                                value: item, child: Text(item)))
                            .toList(),
                        onChanged: (value) =>
                            _bloodController.text = value ?? 'O+',
                      )
                    else
                      DropdownButtonFormField<String>(
                        initialValue: _organController.text,
                        decoration:
                            const InputDecoration(labelText: 'Organ Type'),
                        items: _organTypes
                            .map((item) => DropdownMenuItem(
                                value: item, child: Text(item)))
                            .toList(),
                        onChanged: (value) =>
                            _organController.text = value ?? 'Kidney',
                      ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _cityController,
                            decoration:
                                const InputDecoration(labelText: 'City'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _stateController,
                            decoration:
                                const InputDecoration(labelText: 'State'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _notesController,
                      maxLines: 2,
                      decoration:
                          const InputDecoration(labelText: 'Emergency Notes'),
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFFC62828)),
                      onPressed: _submitting ? null : _createEmergency,
                      icon: _submitting
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.warning_amber_rounded),
                      label: const Text('Create Emergency Request'),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator()))
          else if (_items.isEmpty)
            const EmptyStateWidget(
              title: 'No Emergency Requests',
              message: 'No emergency requests are active right now.',
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, index) {
                final item = _items[index];
                return Container(
                  decoration: const BoxDecoration(
                    border: Border(
                        left: BorderSide(width: 4, color: Color(0xFFC62828))),
                  ),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text('Request #${item.id}',
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium),
                              ),
                              const StatusChip(label: 'EMERGENCY'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('Type: ${item.requestType}'),
                          Text(
                              'Need: ${item.requestType == 'BLOOD' ? item.bloodGroup ?? '-' : item.organType ?? '-'}'),
                          Text('Location: ${item.city}, ${item.state}'),
                          Text('Status: ${item.status}'),
                          Text(
                              'Updated: ${AppFormatters.dateTime(item.updatedAt)}'),
                        ],
                      ),
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
