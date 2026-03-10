class AnalyticsSnapshot {
  const AnalyticsSnapshot({
    required this.totalDonors,
    required this.totalRecipients,
    required this.totalRequests,
    required this.emergencyRequests,
    required this.requestsByStatus,
    required this.bloodGroupDistribution,
    required this.emergencyTrend,
    required this.donationActivity,
  });

  final int totalDonors;
  final int totalRecipients;
  final int totalRequests;
  final int emergencyRequests;
  final Map<String, int> requestsByStatus;
  final Map<String, int> bloodGroupDistribution;
  final List<int> emergencyTrend;
  final List<int> donationActivity;

  factory AnalyticsSnapshot.fromJson(Map<String, dynamic> json) {
    Map<String, int> parseMap(dynamic value) {
      if (value is Map<String, dynamic>) {
        return value.map((key, val) =>
            MapEntry(key.toString(), (val as num?)?.toInt() ?? 0));
      }
      return const <String, int>{};
    }

    List<int> parseList(dynamic value) {
      if (value is List) {
        return value
            .map((entry) => (entry as num?)?.toInt() ?? 0)
            .toList(growable: false);
      }
      return const <int>[];
    }

    return AnalyticsSnapshot(
      totalDonors: (json['total_donors'] as num?)?.toInt() ?? 0,
      totalRecipients: (json['total_recipients'] as num?)?.toInt() ?? 0,
      totalRequests: (json['total_requests'] as num?)?.toInt() ?? 0,
      emergencyRequests: (json['emergency_requests'] as num?)?.toInt() ?? 0,
      requestsByStatus: parseMap(json['requests_by_status']),
      bloodGroupDistribution: parseMap(json['blood_group_distribution']),
      emergencyTrend: parseList(json['emergency_trend']),
      donationActivity: parseList(json['donation_activity']),
    );
  }
}
