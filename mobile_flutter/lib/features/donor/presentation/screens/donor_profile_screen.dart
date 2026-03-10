import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../services/api_parser.dart';
import '../../data/models/donor_profile.dart';
import '../../data/repositories/donor_repository.dart';

class DonorProfileScreen extends ConsumerStatefulWidget {
  const DonorProfileScreen({super.key});

  @override
  ConsumerState<DonorProfileScreen> createState() => _DonorProfileScreenState();
}

class _DonorProfileScreenState extends ConsumerState<DonorProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bloodController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _lastDonationController = TextEditingController();
  final _medicalNotesController = TextEditingController();

  bool _organWilling = false;
  bool _isLoading = true;
  bool _isSaving = false;
  String? _verificationStatus;
  String? _availabilityStatus;
  String? _updatedAt;
  final Set<String> _selectedOrgans = <String>{};

  static const _organOptions = [
    'Kidney',
    'Liver',
    'Heart',
    'Lung',
    'Pancreas',
    'Cornea'
  ];
  static const _bloodOptions = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _bloodController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _lastDonationController.dispose();
    _medicalNotesController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final repo = await ref.read(donorRepositoryProvider.future);
      final profile = await repo.fetchProfile();
      if (profile != null) {
        _setForm(profile);
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiParser.extractMessage(error))));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _setForm(DonorProfile profile) {
    _bloodController.text = profile.bloodGroup;
    _cityController.text = profile.city;
    _stateController.text = profile.state;
    _lastDonationController.text = profile.lastBloodDonationDate ?? '';
    _medicalNotesController.text = profile.medicalNotes ?? '';
    _organWilling = profile.organWilling;
    _selectedOrgans
      ..clear()
      ..addAll(profile.organTypes);
    _verificationStatus = profile.verificationStatus;
    _availabilityStatus = profile.availabilityStatus;
    _updatedAt = profile.updatedAt;
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      initialDate:
          DateTime.tryParse(_lastDonationController.text) ?? DateTime.now(),
    );
    if (picked != null) {
      setState(() => _lastDonationController.text =
          picked.toIso8601String().split('T').first);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_organWilling && _selectedOrgans.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one organ type.')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final repo = await ref.read(donorRepositoryProvider.future);
      final profile = await repo.upsertProfile({
        'blood_group': _bloodController.text.trim(),
        'organ_willing': _organWilling,
        'organ_types': _organWilling
            ? _selectedOrgans.toList(growable: false)
            : <String>[],
        'last_blood_donation_date': _lastDonationController.text.trim().isEmpty
            ? null
            : _lastDonationController.text.trim(),
        'medical_notes': _medicalNotesController.text.trim(),
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
      });

      _setForm(profile);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile saved successfully.')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(ApiParser.extractMessage(error,
                  fallback: 'Unable to save profile.'))),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Donor Profile',
      navItems: AppNavItems.donor,
      currentRoute: RoutePaths.donorProfile,
      notificationRoute: RoutePaths.donorNotifications,
      onRefresh: _load,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_verificationStatus != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Verification: $_verificationStatus'),
                            Text('Availability: ${_availabilityStatus ?? '-'}'),
                            Text(
                                'Updated: ${AppFormatters.dateTime(_updatedAt)}'),
                          ],
                        ),
                      ),
                    ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _bloodController.text.isEmpty
                        ? null
                        : _bloodController.text,
                    decoration: const InputDecoration(labelText: 'Blood Group'),
                    items: _bloodOptions
                        .map((bg) =>
                            DropdownMenuItem(value: bg, child: Text(bg)))
                        .toList(),
                    onChanged: (value) => _bloodController.text = value ?? '',
                    validator: (value) => AppValidators.requiredField(value,
                        fieldName: 'Blood group'),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('Organ willing'),
                    subtitle: const Text('Enable if willing to donate organ'),
                    value: _organWilling,
                    onChanged: (value) => setState(() => _organWilling = value),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _organOptions
                        .map(
                          (organ) => FilterChip(
                            label: Text(organ),
                            selected: _selectedOrgans.contains(organ),
                            onSelected: !_organWilling
                                ? null
                                : (selected) {
                                    setState(() {
                                      if (selected) {
                                        _selectedOrgans.add(organ);
                                      } else {
                                        _selectedOrgans.remove(organ);
                                      }
                                    });
                                  },
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _lastDonationController,
                    readOnly: true,
                    onTap: _selectDate,
                    decoration: const InputDecoration(
                      labelText: 'Last blood donation date',
                      suffixIcon: Icon(Icons.calendar_month),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(labelText: 'City'),
                    validator: (value) =>
                        AppValidators.requiredField(value, fieldName: 'City'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _stateController,
                    decoration: const InputDecoration(labelText: 'State'),
                    validator: (value) =>
                        AppValidators.requiredField(value, fieldName: 'State'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _medicalNotesController,
                    maxLines: 4,
                    decoration:
                        const InputDecoration(labelText: 'Medical notes'),
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _isSaving ? null : _save,
                    icon: _isSaving
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.save_outlined),
                    label: const Text('Save Profile'),
                  ),
                ],
              ),
            ),
    );
  }
}
