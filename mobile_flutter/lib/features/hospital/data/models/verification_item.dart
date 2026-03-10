class VerificationItem {
  const VerificationItem({
    required this.id,
    required this.userId,
    required this.donorName,
    required this.bloodGroup,
    required this.organWilling,
    required this.city,
    required this.verificationStatus,
  });

  final int id;
  final int userId;
  final String donorName;
  final String bloodGroup;
  final bool organWilling;
  final String city;
  final String verificationStatus;

  factory VerificationItem.fromJson(Map<String, dynamic> json) {
    return VerificationItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['user_id'] as num?)?.toInt() ?? 0,
      donorName: (json['donor_name'] ?? '').toString(),
      bloodGroup: (json['blood_group'] ?? '').toString(),
      organWilling: json['organ_willing'] == true,
      city: (json['city'] ?? '').toString(),
      verificationStatus: (json['verification_status'] ?? '').toString(),
    );
  }
}
