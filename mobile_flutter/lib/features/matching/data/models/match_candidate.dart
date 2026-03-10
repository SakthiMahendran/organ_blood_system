class MatchCandidate {
  const MatchCandidate({
    required this.id,
    required this.name,
    required this.requestType,
    this.bloodGroup,
    this.organType,
    required this.city,
    required this.state,
    required this.urgency,
    required this.status,
    required this.availability,
    required this.compatibilityScore,
    required this.confidence,
    required this.explanations,
  });

  final int id;
  final String name;
  final String requestType;
  final String? bloodGroup;
  final String? organType;
  final String city;
  final String state;
  final String urgency;
  final String status;
  final String availability;
  final double compatibilityScore;
  final double confidence;
  final List<String> explanations;

  factory MatchCandidate.fromJson(Map<String, dynamic> json) {
    final reasonsRaw = json['reasons'] ?? json['explanations'];

    return MatchCandidate(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ??
              json['donor_name'] ??
              json['recipient_name'] ??
              'Unknown')
          .toString(),
      requestType: (json['request_type'] ?? 'UNKNOWN').toString(),
      bloodGroup: json['blood_group']?.toString(),
      organType: json['organ_type']?.toString(),
      city: (json['city'] ?? '-').toString(),
      state: (json['state'] ?? '-').toString(),
      urgency: (json['urgency'] ?? 'MEDIUM').toString(),
      status: (json['status'] ?? 'PENDING').toString(),
      availability:
          (json['availability_status'] ?? json['availability'] ?? 'UNKNOWN')
              .toString(),
      compatibilityScore: (json['compatibility_score'] as num?)?.toDouble() ??
          (json['match_score'] as num?)?.toDouble() ??
          0,
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0,
      explanations: (reasonsRaw is List)
          ? reasonsRaw
              .map((item) => item.toString())
              .where((text) => text.isNotEmpty)
              .toList(growable: false)
          : const <String>[],
    );
  }
}
