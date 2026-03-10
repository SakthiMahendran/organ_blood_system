import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/widgets/app_scaffold.dart';
import '../../../../services/api_parser.dart';
import '../../data/models/blood_detection_result.dart';
import '../../data/repositories/blood_detection_repository.dart';

class BloodDetectionScreen extends ConsumerStatefulWidget {
  const BloodDetectionScreen({
    super.key,
    required this.currentRoute,
    required this.navItems,
    this.notificationRoute,
  });

  final String currentRoute;
  final List<AppNavItem> navItems;
  final String? notificationRoute;

  @override
  ConsumerState<BloodDetectionScreen> createState() =>
      _BloodDetectionScreenState();
}

class _BloodDetectionScreenState extends ConsumerState<BloodDetectionScreen> {
  final _sourceController = TextEditingController(text: 'camera-upload');
  final _picker = ImagePicker();

  BloodDetectionResult? _result;
  XFile? _selectedImage;
  bool _loading = false;

  @override
  void dispose() {
    _sourceController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final file = await _picker.pickImage(source: source, imageQuality: 90);
      if (!mounted) return;
      setState(() => _selectedImage = file);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Unable to choose image.'))),
      );
    }
  }

  Future<void> _analyze() async {
    final source = _sourceController.text.trim().isEmpty
        ? 'sample'
        : _sourceController.text.trim();

    setState(() => _loading = true);
    try {
      final repo = await ref.read(bloodDetectionRepositoryProvider.future);
      final result = await repo.runPrototype(
        source: source,
        imageFile: _selectedImage,
      );
      if (!mounted) return;
      setState(() => _result = result);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Unable to analyze sample.'))),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Blood Group Detection',
      navItems: widget.navItems,
      currentRoute: widget.currentRoute,
      notificationRoute: widget.notificationRoute,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Blood Group Detection (Prototype)',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    'AI result is assistive only. Confirm with certified laboratory testing.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.color
                              ?.withValues(alpha: 0.78),
                        ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _sourceController,
                    decoration: const InputDecoration(
                      labelText:
                          'Source Label (camera-upload, sample-strip, lab-image)',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      OutlinedButton.icon(
                        onPressed: _loading
                            ? null
                            : () => _pickImage(ImageSource.gallery),
                        icon: const Icon(Icons.upload_file_outlined),
                        label: const Text('Choose Photo'),
                      ),
                      FilledButton.tonalIcon(
                        onPressed: _loading
                            ? null
                            : () => _pickImage(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt_outlined),
                        label: const Text('Use Camera'),
                      ),
                      if (_selectedImage != null)
                        TextButton(
                          onPressed: _loading
                              ? null
                              : () => setState(() => _selectedImage = null),
                          child: const Text('Remove'),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _selectedImage != null
                        ? 'Selected: ${_selectedImage!.name}'
                        : 'No photo selected (optional).',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerRight,
                    child: FilledButton.icon(
                      onPressed: _loading ? null : _analyze,
                      icon: _loading
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.science_outlined),
                      label: Text(_loading ? 'Detecting...' : 'Run Detection'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (_result != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text('Predicted Group:',
                            style: Theme.of(context).textTheme.titleMedium),
                        Chip(label: Text(_result!.bloodGroup)),
                        Chip(
                            label: Text(
                                'Confidence: ${_result!.confidence.toStringAsFixed(1)}%')),
                        Chip(label: Text('Input: ${_result!.inputType}')),
                      ],
                    ),
                    const SizedBox(height: 10),
                    LinearProgressIndicator(
                      value: (_result!.confidence / 100).clamp(0, 1),
                      minHeight: 8,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    const SizedBox(height: 10),
                    Text(_result!.summary),
                    const SizedBox(height: 6),
                    Text(
                      'Source: ${_result!.sourceLabel.isEmpty ? _sourceController.text.trim() : _result!.sourceLabel}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF4E5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _result!.disclaimer,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
