import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/theme/theme_mode_provider.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/user_role.dart';
import '../providers/auth_controller.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();

  UserRole _selectedRole = UserRole.donor;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final success = await ref.read(authControllerProvider.notifier).register(
          username: _nameController.text.trim(),
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
          password: _passwordController.text,
          address: _addressController.text.trim(),
          city: _cityController.text.trim(),
          stateValue: _stateController.text.trim(),
          role: _selectedRole,
        );

    if (!mounted) return;

    if (!success) {
      final auth = ref.read(authControllerProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage ?? 'Registration failed.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
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
                constraints: const BoxConstraints(maxWidth: 480),
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
                            'Create Account',
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Register as Donor or Acceptor',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.color
                                      ?.withValues(alpha: 0.75),
                                ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _nameController,
                            decoration:
                                const InputDecoration(labelText: 'Full Name'),
                            validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName: 'Name'),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _emailController,
                            decoration:
                                const InputDecoration(labelText: 'Email'),
                            validator: AppValidators.email,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _phoneController,
                            decoration:
                                const InputDecoration(labelText: 'Phone'),
                            validator: AppValidators.phone,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              labelText: 'Password',
                              suffixIcon: IconButton(
                                onPressed: () => setState(
                                    () => _obscurePassword = !_obscurePassword),
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                ),
                              ),
                            ),
                            validator: AppValidators.password,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _addressController,
                            decoration:
                                const InputDecoration(labelText: 'Address'),
                            validator: (value) => AppValidators.requiredField(
                                value,
                                fieldName: 'Address'),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: _cityController,
                                  decoration:
                                      const InputDecoration(labelText: 'City'),
                                  validator: (value) =>
                                      AppValidators.requiredField(value,
                                          fieldName: 'City'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: TextFormField(
                                  controller: _stateController,
                                  decoration:
                                      const InputDecoration(labelText: 'State'),
                                  validator: (value) =>
                                      AppValidators.requiredField(value,
                                          fieldName: 'State'),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          DropdownButtonFormField<UserRole>(
                            initialValue: _selectedRole,
                            decoration:
                                const InputDecoration(labelText: 'Role'),
                            items: const [
                              DropdownMenuItem(
                                  value: UserRole.donor, child: Text('Donor')),
                              DropdownMenuItem(
                                  value: UserRole.acceptor,
                                  child: Text('Acceptor')),
                            ],
                            onChanged: auth.isLoading
                                ? null
                                : (value) {
                                    if (value != null) {
                                      setState(() => _selectedRole = value);
                                    }
                                  },
                          ),
                          const SizedBox(height: 18),
                          FilledButton.icon(
                            onPressed: auth.isLoading ? null : _submit,
                            icon: auth.isLoading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Icon(Icons.app_registration),
                            label: const Text('Create Account'),
                          ),
                          const SizedBox(height: 6),
                          TextButton(
                            onPressed: auth.isLoading
                                ? null
                                : () => context.go(RoutePaths.login),
                            child: const Text('Back to Login'),
                          ),
                          TextButton(
                            onPressed: auth.isLoading
                                ? null
                                : () =>
                                    context.push(RoutePaths.registerHospital),
                            child: const Text('Register Hospital / Blood Bank'),
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
