import 'package:flutter/material.dart';

import '../routing/route_paths.dart';
import '../widgets/app_scaffold.dart';

class AppNavItems {
  const AppNavItems._();

  static const donor = <AppNavItem>[
    AppNavItem(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        route: RoutePaths.donorDashboard),
    AppNavItem(
        label: 'Profile',
        icon: Icons.person_outline,
        route: RoutePaths.donorProfile),
    AppNavItem(
        label: 'Matches',
        icon: Icons.favorite_border,
        route: RoutePaths.donorMatches),
    AppNavItem(
        label: 'Alerts',
        icon: Icons.notifications_none,
        route: RoutePaths.donorNotifications),
  ];

  static const acceptor = <AppNavItem>[
    AppNavItem(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        route: RoutePaths.acceptorDashboard),
    AppNavItem(
        label: 'Create',
        icon: Icons.add_box_outlined,
        route: RoutePaths.acceptorCreateRequest),
    AppNavItem(
        label: 'Track',
        icon: Icons.timeline_outlined,
        route: RoutePaths.acceptorTrackRequests),
    AppNavItem(
        label: 'Search',
        icon: Icons.search,
        route: RoutePaths.acceptorSearchDonors),
    AppNavItem(
        label: 'Alerts',
        icon: Icons.notifications_none,
        route: RoutePaths.acceptorNotifications),
  ];

  static const hospital = <AppNavItem>[
    AppNavItem(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        route: RoutePaths.hospitalDashboard),
    AppNavItem(
        label: 'Verify',
        icon: Icons.verified_user_outlined,
        route: RoutePaths.hospitalVerifyDonors),
    AppNavItem(
        label: 'Requests',
        icon: Icons.assignment_outlined,
        route: RoutePaths.hospitalRequests),
  ];

  static const admin = <AppNavItem>[
    AppNavItem(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        route: RoutePaths.adminDashboard),
    AppNavItem(
        label: 'Users',
        icon: Icons.people_alt_outlined,
        route: RoutePaths.adminUsers),
    AppNavItem(
        label: 'Hospitals',
        icon: Icons.local_hospital_outlined,
        route: RoutePaths.adminHospitals),
    AppNavItem(
        label: 'Audit',
        icon: Icons.fact_check_outlined,
        route: RoutePaths.adminAudit),
  ];
}
