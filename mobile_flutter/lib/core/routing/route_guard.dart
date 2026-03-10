import 'package:flutter/material.dart';

import 'route_paths.dart';

class RouteGuard {
  const RouteGuard._();

  static bool isPublicRoute(String location) {
    return location == RoutePaths.login ||
        location == RoutePaths.register ||
        location == RoutePaths.registerHospital ||
        location == RoutePaths.splash;
  }

  static bool isRoleRouteAllowed(String location, String role) {
    final normalized = role.toUpperCase();

    if (location.startsWith('/donor/')) {
      return normalized == 'DONOR';
    }
    if (location.startsWith('/acceptor/')) {
      return normalized == 'ACCEPTOR';
    }
    if (location.startsWith('/hospital/')) {
      return normalized == 'HOSPITAL';
    }
    if (location.startsWith('/admin/')) {
      return normalized == 'ADMIN';
    }

    return true;
  }

  static void showBlockedSnack(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('You are not allowed to access this module.')),
    );
  }
}
