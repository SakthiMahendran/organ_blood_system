class DonorSearchItem {
  const DonorSearchItem({
    required this.id,
    required this.userId,
    required this.name,
    this.bloodGroup,
    required this.organWilling,
    required this.organTypes,
    required this.city,
    required this.state,
    required this.verificationStatus,
    required this.availabilityStatus,
    this.compatibilityScore,
    this.confidence,
    this.urgency,
  });

  final int id;
  final int userId;
  final String name;
  final String? bloodGroup;
  final bool organWilling;
  final List<String> organTypes;
  final String city;
  final String state;
  final String verificationStatus;
  final String availabilityStatus;
  final double? compatibilityScore;
  final double? confidence;
  final String? urgency;

  factory DonorSearchItem.fromJson(Map<String, dynamic> json) {
    return DonorSearchItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['user_id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? '').toString(),
      bloodGroup: json['blood_group']?.toString(),
      organWilling: json['organ_willing'] == true,
      organTypes: (json['organ_types'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(growable: false),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      verificationStatus: (json['verification_status'] ?? '').toString(),
      availabilityStatus: (json['availability_status'] ?? '').toString(),
      compatibilityScore: (json['compatibility_score'] as num?)?.toDouble(),
      confidence: (json['confidence'] as num?)?.toDouble(),
      urgency: json['urgency']?.toString(),
    );
  }
}
