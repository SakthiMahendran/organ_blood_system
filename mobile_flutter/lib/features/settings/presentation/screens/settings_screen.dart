import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/theme_mode_provider.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../providers/app_settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({
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
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(appSettingsProvider);
    final themeMode = ref.watch(themeModeProvider);

    return AppScaffold(
      title: title,
      navItems: navItems,
      currentRoute: currentRoute,
      notificationRoute: notificationRoute,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  value: themeMode == ThemeMode.dark,
                  onChanged: (value) => ref
                      .read(themeModeProvider.notifier)
                      .setMode(value ? ThemeMode.dark : ThemeMode.light),
                  title: const Text('Dark Mode'),
                  subtitle:
                      const Text('Switch between dark and light appearance'),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  value: settings.notificationsEnabled,
                  onChanged: (value) => ref
                      .read(appSettingsProvider.notifier)
                      .setNotifications(value),
                  title: const Text('Notifications'),
                  subtitle: const Text('Enable in-app updates and reminders'),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  value: settings.privacyMode,
                  onChanged: (value) => ref
                      .read(appSettingsProvider.notifier)
                      .setPrivacyMode(value),
                  title: const Text('Privacy Mode'),
                  subtitle:
                      const Text('Mask sensitive profile and medical details'),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  value: settings.emergencyAlertsEnabled,
                  onChanged: (value) => ref
                      .read(appSettingsProvider.notifier)
                      .setEmergencyAlerts(value),
                  title: const Text('Emergency Alerts'),
                  subtitle:
                      const Text('Receive priority emergency request alerts'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline),
                  title: const Text('About App'),
                  subtitle: const Text(
                      'Organ & Blood Bank Donation System (Demo-ready build)'),
                  onTap: () {
                    showAboutDialog(
                      context: context,
                      applicationName: 'Organ & Blood Bank',
                      applicationVersion: '1.0.0',
                      children: const [
                        Text(
                            'Mobile frontend for donor-recipient-hospital-admin workflows.'),
                      ],
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.help_outline),
                  title: const Text('Help & Support'),
                  subtitle: const Text(
                      'Contact project admin or hospital support desk'),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Support: support@organblood.demo')),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.tonalIcon(
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
            label: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}
