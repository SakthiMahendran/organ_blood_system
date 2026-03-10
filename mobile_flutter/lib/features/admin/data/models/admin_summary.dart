class AdminSummary {
  const AdminSummary({
    required this.totalUsers,
    required this.totalDonors,
    required this.verifiedDonors,
    required this.activeRequests,
    required this.fulfilledRequests,
  });

  final int totalUsers;
  final int totalDonors;
  final int verifiedDonors;
  final int activeRequests;
  final int fulfilledRequests;

  factory AdminSummary.fromJson(Map<String, dynamic> json) {
    return AdminSummary(
      totalUsers: (json['total_users'] as num?)?.toInt() ?? 0,
      totalDonors: (json['total_donors'] as num?)?.toInt() ?? 0,
      verifiedDonors: (json['verified_donors'] as num?)?.toInt() ?? 0,
      activeRequests: (json['active_requests'] as num?)?.toInt() ?? 0,
      fulfilledRequests: (json['fulfilled_requests'] as num?)?.toInt() ?? 0,
    );
  }
}
