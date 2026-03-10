import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/route_paths.dart';
import '../../../../core/theme/theme_mode_provider.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/user_role.dart';
import '../providers/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final success = await ref.read(authControllerProvider.notifier).login(
          identifier: _identifierController.text.trim(),
          password: _passwordController.text,
        );

    if (!mounted) return;

    final auth = ref.read(authControllerProvider);
    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage ?? 'Login failed.')),
      );
    }
  }

  Future<void> _startDemo(UserRole role) async {
    await ref.read(authControllerProvider.notifier).startOfflineDemo(role);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Offline demo started as ${role.label}.')),
    );
  }

  void _showDemoPicker() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Start Offline Demo',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 6),
                Text(
                  'Pick a role and explore the app without internet/backend.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.color
                            ?.withValues(alpha: 0.75),
                      ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ('Donor', UserRole.donor),
                    ('Acceptor', UserRole.acceptor),
                    ('Hospital', UserRole.hospital),
                    ('Admin', UserRole.admin),
                  ].map((entry) {
                    return FilledButton.tonal(
                      onPressed: () {
                        Navigator.pop(context);
                        _startDemo(entry.$2);
                      },
                      child: Text(entry.$1),
                    );
                  }).toList(growable: false),
                ),
              ],
            ),
          ),
        );
      },
    );
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
              padding: const EdgeInsets.all(20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
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
                      'Organ & Blood Bank',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Donation & Donor Finder',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.color
                                ?.withValues(alpha: 0.78),
                          ),
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Welcome Back',
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Login using email or phone and password.',
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
                              const SizedBox(height: 18),
                              TextFormField(
                                controller: _identifierController,
                                decoration: const InputDecoration(
                                  labelText: 'Email or Phone',
                                  prefixIcon: Icon(Icons.person_outline),
                                ),
                                validator: (value) =>
                                    AppValidators.requiredField(value,
                                        fieldName: 'Email/Phone'),
                              ),
                              const SizedBox(height: 14),
                              TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                decoration: InputDecoration(
                                  labelText: 'Password',
                                  prefixIcon: const Icon(Icons.lock_outline),
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
                              const SizedBox(height: 20),
                              FilledButton.icon(
                                onPressed: auth.isLoading ? null : _submit,
                                icon: auth.isLoading
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2),
                                      )
                                    : const Icon(Icons.login),
                                label: const Text('Login'),
                              ),
                              const SizedBox(height: 6),
                              FilledButton.tonalIcon(
                                onPressed:
                                    auth.isLoading ? null : _showDemoPicker,
                                icon: const Icon(Icons.offline_bolt_outlined),
                                label: const Text('Start Offline Demo'),
                              ),
                              const SizedBox(height: 8),
                              TextButton(
                                onPressed: auth.isLoading
                                    ? null
                                    : () => context.push(RoutePaths.register),
                                child: const Text('Create an account'),
                              ),
                              TextButton(
                                onPressed: auth.isLoading
                                    ? null
                                    : () => context
                                        .push(RoutePaths.registerHospital),
                                child: const Text(
                                    'Register Hospital / Blood Bank'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
