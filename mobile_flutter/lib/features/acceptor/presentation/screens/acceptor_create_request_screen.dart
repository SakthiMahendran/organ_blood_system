import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../services/api_parser.dart';
import '../../data/repositories/acceptor_repository.dart';
import '../providers/acceptor_providers.dart';

class AcceptorCreateRequestScreen extends ConsumerStatefulWidget {
  const AcceptorCreateRequestScreen({super.key});

  @override
  ConsumerState<AcceptorCreateRequestScreen> createState() =>
      _AcceptorCreateRequestScreenState();
}

class _AcceptorCreateRequestScreenState
    extends ConsumerState<AcceptorCreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();

  bool _isBlood = true;
  bool _isSubmitting = false;

  final _bloodGroupController = TextEditingController();
  final _unitsController = TextEditingController();
  final _organTypeController = TextEditingController();
  final _urgencyController = TextEditingController(text: 'MEDIUM');
  final _dateController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _notesController = TextEditingController();

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
  static const _urgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  @override
  void dispose() {
    _bloodGroupController.dispose();
    _unitsController.dispose();
    _organTypeController.dispose();
    _urgencyController.dispose();
    _dateController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDate: DateTime.now(),
    );
    if (picked != null) {
      _dateController.text = picked.toIso8601String().split('T').first;
      setState(() {});
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      final repo = await ref.read(acceptorRepositoryProvider.future);

      final payload = {
        'required_date': _dateController.text.trim().isEmpty
            ? null
            : _dateController.text.trim(),
        'urgency': _urgencyController.text.trim(),
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
        'notes': _notesController.text.trim(),
      };

      if (_isBlood) {
        await repo.createBloodRequest({
          ...payload,
          'blood_group': _bloodGroupController.text.trim(),
          'units_needed': int.tryParse(_unitsController.text.trim()) ?? 1,
        });
      } else {
        await repo.createOrganRequest({
          ...payload,
          'organ_type': _organTypeController.text.trim(),
        });
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Request created successfully.')));
      }

      ref.invalidate(acceptorRequestsProvider);
      _formKey.currentState?.reset();
      _bloodGroupController.clear();
      _unitsController.clear();
      _organTypeController.clear();
      _dateController.clear();
      _cityController.clear();
      _stateController.clear();
      _notesController.clear();
      setState(() {});
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(ApiParser.extractMessage(error,
                  fallback: 'Failed to create request.'))),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Create Request',
      navItems: AppNavItems.acceptor,
      currentRoute: RoutePaths.acceptorCreateRequest,
      notificationRoute: RoutePaths.acceptorNotifications,
      body: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SegmentedButton<bool>(
              segments: const [
                ButtonSegment<bool>(value: true, label: Text('Blood')),
                ButtonSegment<bool>(value: false, label: Text('Organ')),
              ],
              selected: {_isBlood},
              onSelectionChanged: (selection) =>
                  setState(() => _isBlood = selection.first),
            ),
            const SizedBox(height: 12),
            if (_isBlood) ...[
              DropdownButtonFormField<String>(
                initialValue: _bloodGroupController.text.isEmpty
                    ? null
                    : _bloodGroupController.text,
                decoration: const InputDecoration(labelText: 'Blood Group'),
                items: _bloodGroups
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (value) => _bloodGroupController.text = value ?? '',
                validator: (value) => AppValidators.requiredField(value,
                    fieldName: 'Blood group'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _unitsController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Units Needed'),
                validator: (value) {
                  final required =
                      AppValidators.requiredField(value, fieldName: 'Units');
                  if (required != null) return required;
                  if (int.tryParse(value!) == null || int.parse(value) < 1) {
                    return 'Units must be at least 1';
                  }
                  return null;
                },
              ),
            ] else ...[
              DropdownButtonFormField<String>(
                initialValue: _organTypeController.text.isEmpty
                    ? null
                    : _organTypeController.text,
                decoration: const InputDecoration(labelText: 'Organ Type'),
                items: _organTypes
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (value) => _organTypeController.text = value ?? '',
                validator: (value) =>
                    AppValidators.requiredField(value, fieldName: 'Organ type'),
              ),
            ],
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _urgencyController.text,
              decoration: const InputDecoration(labelText: 'Urgency'),
              items: _urgencies
                  .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                  .toList(),
              onChanged: (value) => _urgencyController.text = value ?? 'MEDIUM',
              validator: (value) =>
                  AppValidators.requiredField(value, fieldName: 'Urgency'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _dateController,
              readOnly: true,
              onTap: _pickDate,
              decoration: const InputDecoration(
                labelText: 'Required Date',
                suffixIcon: Icon(Icons.calendar_today_outlined),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(labelText: 'City'),
                    validator: (value) =>
                        AppValidators.requiredField(value, fieldName: 'City'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _stateController,
                    decoration: const InputDecoration(labelText: 'State'),
                    validator: (value) =>
                        AppValidators.requiredField(value, fieldName: 'State'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesController,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Notes'),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _isSubmitting ? null : _submit,
              icon: _isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.send_outlined),
              label: const Text('Submit Request'),
            ),
          ],
        ),
      ),
    );
  }
}
