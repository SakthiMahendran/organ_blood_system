import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../services/notification_providers.dart';
import '../demo/demo_mode.dart';
import '../theme/theme_mode_provider.dart';

class AppNavItem {
  const AppNavItem(
      {required this.label, required this.icon, required this.route});

  final String label;
  final IconData icon;
  final String route;
}

class AppScaffold extends ConsumerWidget {
  const AppScaffold({
    super.key,
    required this.title,
    required this.navItems,
    required this.currentRoute,
    required this.body,
    this.floatingActionButton,
    this.actions,
    this.onRefresh,
    this.notificationRoute,
    this.scrollableBody = true,
  });

  final String title;
  final List<AppNavItem> navItems;
  final String currentRoute;
  final Widget body;
  final Widget? floatingActionButton;
  final List<Widget>? actions;
  final Future<void> Function()? onRefresh;
  final String? notificationRoute;
  final bool scrollableBody;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rawIndex = navItems.indexWhere((item) => item.route == currentRoute);
    final currentIndex = rawIndex < 0 ? 0 : rawIndex;
    final demoSession = ref.watch(demoSessionProvider);
    final unreadCount = ref.watch(unreadNotificationCountProvider);
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

    final appBarActions = <Widget>[
      IconButton(
        tooltip: isDark ? 'Switch to light mode' : 'Switch to dark mode',
        onPressed: () => ref.read(themeModeProvider.notifier).toggle(),
        icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded),
      ),
      if (notificationRoute != null)
        IconButton(
          tooltip: 'Notifications',
          onPressed: () => context.go(notificationRoute!),
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.notifications_none),
              if (unreadCount > 0)
                Positioned(
                  right: -6,
                  top: -6,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFC62828),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      unreadCount > 99 ? '99+' : '$unreadCount',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
            ],
          ),
        ),
      if (demoSession.enabled)
        Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color:
                Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            'OFFLINE DEMO',
            style: TextStyle(
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.w800,
              fontSize: 11,
            ),
          ),
        ),
      ...?actions,
    ];

    final content = scrollableBody
        ? RefreshIndicator(
            onRefresh: onRefresh ?? () async {},
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
              child: body,
            ),
          )
        : Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
            child: body,
          );

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(title),
        actions: appBarActions,
      ),
      body: Container(
        decoration: BoxDecoration(gradient: gradient),
        child: SafeArea(child: content),
      ),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          context.go(navItems[index].route);
        },
        destinations: [
          for (final item in navItems)
            NavigationDestination(
              icon: Icon(item.icon),
              label: item.label,
            ),
        ],
      ),
    );
  }
}
