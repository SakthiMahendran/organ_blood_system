class MatchItem {
  const MatchItem({
    required this.id,
    required this.requestId,
    required this.donorEmail,
    required this.matchScore,
    required this.donorResponse,
    required this.createdAt,
  });

  final int id;
  final int requestId;
  final String donorEmail;
  final double matchScore;
  final String donorResponse;
  final String createdAt;

  factory MatchItem.fromJson(Map<String, dynamic> json) {
    return MatchItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      requestId: (json['request'] as num?)?.toInt() ?? 0,
      donorEmail: (json['donor_email'] ?? '').toString(),
      matchScore: (json['match_score'] as num?)?.toDouble() ?? 0,
      donorResponse: (json['donor_response'] ?? '').toString(),
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}
