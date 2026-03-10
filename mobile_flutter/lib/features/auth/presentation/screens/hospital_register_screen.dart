import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/theme/theme_mode_provider.dart';
import '../../../../core/utils/validators.dart';
import '../providers/auth_controller.dart';

class HospitalRegisterScreen extends ConsumerStatefulWidget {
  const HospitalRegisterScreen({super.key});

  @override
  ConsumerState<HospitalRegisterScreen> createState() =>
      _HospitalRegisterScreenState();
}

class _HospitalRegisterScreenState
    extends ConsumerState<HospitalRegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _hospitalNameController = TextEditingController();
  final _registrationNumberController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();

  final _addressLine1Controller = TextEditingController();
  final _addressLine2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();

  final _contactPersonNameController = TextEditingController();
  final _contactPersonRoleController = TextEditingController();
  final _contactPersonPhoneController = TextEditingController();

  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _licenseDocumentController = TextEditingController();
  final _hospitalIdProofController = TextEditingController();

  String? _institutionType;
  bool _bloodBankAvailable = false;
  bool _organTransplantSupport = false;
  bool _emergencyResponse = false;

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isSubmitting = false;

  final Set<String> _selectedBloodGroups = <String>{};
  String? _bloodGroupError;

  static const List<String> _institutionTypes = [
    'Hospital',
    'Blood Bank',
    'Clinic',
    'Multi-speciality',
    'Government Hospital',
    'Private Hospital',
  ];

  static const List<String> _bloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];

  @override
  void dispose() {
    _hospitalNameController.dispose();
    _registrationNumberController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _contactPersonNameController.dispose();
    _contactPersonRoleController.dispose();
    _contactPersonPhoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _licenseDocumentController.dispose();
    _hospitalIdProofController.dispose();
    super.dispose();
  }

  int _resolveColumns(double width, {int desktopColumns = 2}) {
    if (width >= 1024) return desktopColumns;
    if (width >= 700 && desktopColumns > 1) return 2;
    return 1;
  }

  Widget _buildGrid(List<Widget> fields, {int desktopColumns = 2}) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const spacing = 12.0;
        final columns = _resolveColumns(constraints.maxWidth,
            desktopColumns: desktopColumns);
        final itemWidth =
            (constraints.maxWidth - (spacing * (columns - 1))) / columns;

        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final field in fields)
              SizedBox(
                width: itemWidth,
                child: field,
              ),
          ],
        );
      },
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 10),
      child: Text(
        title,
        style: Theme.of(context)
            .textTheme
            .titleMedium
            ?.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }

  String? _validatePincode(String? value) {
    final required = AppValidators.requiredField(value, fieldName: 'Pincode');
    if (required != null) return required;

    final valid = RegExp(r'^[0-9]{4,10}$').hasMatch(value!.trim());
    if (!valid) {
      return 'Enter a valid pincode';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    final required =
        AppValidators.requiredField(value, fieldName: 'Confirm Password');
    if (required != null) return required;

    if (value != _passwordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  Future<void> _submit() async {
    final formValid = _formKey.currentState?.validate() ?? false;
    if (!formValid) {
      return;
    }

    if (_selectedBloodGroups.isEmpty) {
      setState(
          () => _bloodGroupError = 'Select at least one supported blood group');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _bloodGroupError = null;
    });

    final success = await ref
        .read(authControllerProvider.notifier)
        .registerHospital(
          hospitalName: _hospitalNameController.text.trim(),
          registrationNumber: _registrationNumberController.text.trim(),
          institutionType: _institutionType!.trim(),
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
          addressLine1: _addressLine1Controller.text.trim(),
          addressLine2: _addressLine2Controller.text.trim().isEmpty
              ? null
              : _addressLine2Controller.text.trim(),
          city: _cityController.text.trim(),
          stateValue: _stateController.text.trim(),
          pincode: _pincodeController.text.trim(),
          contactPersonName: _contactPersonNameController.text.trim(),
          contactPersonRole: _contactPersonRoleController.text.trim(),
          contactPersonPhone: _contactPersonPhoneController.text.trim(),
          bloodBankAvailable: _bloodBankAvailable,
          organTransplantSupport: _organTransplantSupport,
          emergencyResponse: _emergencyResponse,
          supportedBloodGroups: _selectedBloodGroups.toList(growable: false),
          password: _passwordController.text,
          confirmPassword: _confirmPasswordController.text,
          licenseDocumentName: _licenseDocumentController.text.trim().isEmpty
              ? null
              : _licenseDocumentController.text.trim(),
          hospitalIdProofName: _hospitalIdProofController.text.trim().isEmpty
              ? null
              : _hospitalIdProofController.text.trim(),
        );

    if (!mounted) return;

    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Hospital registration submitted successfully. Awaiting admin approval.'),
        ),
      );
      context.go(RoutePaths.login);
      return;
    }

    final auth = ref.read(authControllerProvider);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text(auth.errorMessage ?? 'Hospital registration failed.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gradient = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: isDark
          ? const [
              Color(0xFF071120),
              Color(0xFF0E2033),
              Color(0xFF132A42),
            ]
          : const [
              Color(0xFFEAF4FA),
              Color(0xFFF4F7FB),
              Color(0xFFF7FCFA),
            ],
    );

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: gradient),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 980),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Align(
                            alignment: Alignment.centerRight,
                            child: IconButton(
                              tooltip: isDark
                                  ? 'Switch to light mode'
                                  : 'Switch to dark mode',
                              onPressed: () =>
                                  ref.read(themeModeProvider.notifier).toggle(),
                              icon: Icon(isDark
                                  ? Icons.light_mode_rounded
                                  : Icons.dark_mode_rounded),
                            ),
                          ),
                          Text(
                            'Hospital / Blood Bank Registration',
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Submit your institution profile for admin verification.',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.color
                                        ?.withValues(alpha: 0.75)),
                          ),
                          const SizedBox(height: 20),
                          _sectionTitle('Institution Details'),
                          _buildGrid([
                            TextFormField(
                              controller: _hospitalNameController,
                              decoration: const InputDecoration(
                                  labelText: 'Hospital / Blood Bank Name'),
                              validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName: 'Hospital / Blood Bank Name',
                              ),
                            ),
                            TextFormField(
                              controller: _registrationNumberController,
                              decoration: const InputDecoration(
                                  labelText:
                                      'Registration Number / License Number'),
                              validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName:
                                    'Registration Number / License Number',
                              ),
                            ),
                            DropdownButtonFormField<String>(
                              initialValue: _institutionType,
                              decoration: const InputDecoration(
                                  labelText: 'Institution Type'),
                              items: _institutionTypes
                                  .map((value) => DropdownMenuItem(
                                      value: value, child: Text(value)))
                                  .toList(growable: false),
                              onChanged: _isSubmitting
                                  ? null
                                  : (value) {
                                      setState(() => _institutionType = value);
                                    },
                              validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName: 'Institution Type',
                              ),
                            ),
                            TextFormField(
                              controller: _emailController,
                              decoration:
                                  const InputDecoration(labelText: 'Email'),
                              keyboardType: TextInputType.emailAddress,
                              validator: AppValidators.email,
                            ),
                            TextFormField(
                              controller: _phoneController,
                              decoration:
                                  const InputDecoration(labelText: 'Phone'),
                              keyboardType: TextInputType.phone,
                              validator: AppValidators.phone,
                            ),
                          ], desktopColumns: 2),
                          const SizedBox(height: 10),
                          const Divider(),
                          _sectionTitle('Location'),
                          _buildGrid([
                            TextFormField(
                              controller: _addressLine1Controller,
                              decoration: const InputDecoration(
                                  labelText: 'Address Line 1'),
                              validator: (value) => AppValidators.requiredField(
                                  value,
                                  fieldName: 'Address Line 1'),
                            ),
                            TextFormField(
                              controller: _addressLine2Controller,
                              decoration: const InputDecoration(
                                  labelText: 'Address Line 2 (Optional)'),
                            ),
                            TextFormField(
                              controller: _cityController,
                              decoration:
                                  const InputDecoration(labelText: 'City'),
                              validator: (value) => AppValidators.requiredField(
                                  value,
                                  fieldName: 'City'),
                            ),
                            TextFormField(
                              controller: _stateController,
                              decoration:
                                  const InputDecoration(labelText: 'State'),
                              validator: (value) => AppValidators.requiredField(
                                  value,
                                  fieldName: 'State'),
                            ),
                            TextFormField(
                              controller: _pincodeController,
                              decoration:
                                  const InputDecoration(labelText: 'Pincode'),
                              keyboardType: TextInputType.number,
                              validator: _validatePincode,
                            ),
                          ], desktopColumns: 2),
                          const SizedBox(height: 10),
                          const Divider(),
                          _sectionTitle('Authorized Contact Person'),
                          _buildGrid([
                            TextFormField(
                              controller: _contactPersonNameController,
                              decoration:
                                  const InputDecoration(labelText: 'Full Name'),
                              validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName: 'Contact Person Name',
                              ),
                            ),
                            TextFormField(
                              controller: _contactPersonRoleController,
                              decoration: const InputDecoration(
                                  labelText: 'Role / Designation'),
                              validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName: 'Role / Designation',
                              ),
                            ),
                            TextFormField(
                              controller: _contactPersonPhoneController,
                              decoration: const InputDecoration(
                                  labelText: 'Contact Number'),
                              keyboardType: TextInputType.phone,
                              validator: AppValidators.phone,
                            ),
                          ], desktopColumns: 3),
                          const SizedBox(height: 10),
                          const Divider(),
                          _sectionTitle('Capabilities'),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              FilterChip(
                                label: const Text('Blood bank available'),
                                selected: _bloodBankAvailable,
                                onSelected: _isSubmitting
                                    ? null
                                    : (value) => setState(
                                        () => _bloodBankAvailable = value),
                              ),
                              FilterChip(
                                label: const Text('Organ transplant support'),
                                selected: _organTransplantSupport,
                                onSelected: _isSubmitting
                                    ? null
                                    : (value) => setState(
                                        () => _organTransplantSupport = value),
                              ),
                              FilterChip(
                                label:
                                    const Text('Emergency response available'),
                                selected: _emergencyResponse,
                                onSelected: _isSubmitting
                                    ? null
                                    : (value) => setState(
                                        () => _emergencyResponse = value),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Supported Blood Groups',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _bloodGroups
                                .map(
                                  (group) => FilterChip(
                                    label: Text(group),
                                    selected:
                                        _selectedBloodGroups.contains(group),
                                    onSelected: _isSubmitting
                                        ? null
                                        : (selected) {
                                            setState(() {
                                              if (selected) {
                                                _selectedBloodGroups.add(group);
                                              } else {
                                                _selectedBloodGroups
                                                    .remove(group);
                                              }
                                              if (_selectedBloodGroups
                                                  .isNotEmpty) {
                                                _bloodGroupError = null;
                                              }
                                            });
                                          },
                                  ),
                                )
                                .toList(growable: false),
                          ),
                          if (_bloodGroupError != null) ...[
                            const SizedBox(height: 6),
                            Text(
                              _bloodGroupError!,
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.error),
                            ),
                          ],
                          const SizedBox(height: 10),
                          const Divider(),
                          _sectionTitle('Account Setup'),
                          _buildGrid([
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              decoration: InputDecoration(
                                labelText: 'Password',
                                suffixIcon: IconButton(
                                  onPressed: () => setState(() =>
                                      _obscurePassword = !_obscurePassword),
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                ),
                              ),
                              validator: AppValidators.password,
                            ),
                            TextFormField(
                              controller: _confirmPasswordController,
                              obscureText: _obscureConfirmPassword,
                              decoration: InputDecoration(
                                labelText: 'Confirm Password',
                                suffixIcon: IconButton(
                                  onPressed: () => setState(() =>
                                      _obscureConfirmPassword =
                                          !_obscureConfirmPassword),
                                  icon: Icon(
                                    _obscureConfirmPassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                ),
                              ),
                              validator: _validateConfirmPassword,
                            ),
                          ], desktopColumns: 2),
                          const SizedBox(height: 10),
                          const Divider(),
                          _sectionTitle('Compliance / Verification (Optional)'),
                          _buildGrid([
                            TextFormField(
                              controller: _licenseDocumentController,
                              decoration: const InputDecoration(
                                labelText: 'License Document',
                                hintText:
                                    'Enter filename (upload support can be added later)',
                                suffixIcon: Icon(Icons.upload_file_outlined),
                              ),
                            ),
                            TextFormField(
                              controller: _hospitalIdProofController,
                              decoration: const InputDecoration(
                                labelText: 'Hospital ID Proof',
                                hintText:
                                    'Enter filename (upload support can be added later)',
                                suffixIcon: Icon(Icons.badge_outlined),
                              ),
                            ),
                          ], desktopColumns: 2),
                          const SizedBox(height: 18),
                          FilledButton.icon(
                            onPressed: _isSubmitting ? null : _submit,
                            icon: _isSubmitting
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Icon(Icons.verified_user_outlined),
                            label: const Text('Submit for Verification'),
                          ),
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: _isSubmitting
                                ? null
                                : () => context.go(RoutePaths.login),
                            child: const Text('Back to Login'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
