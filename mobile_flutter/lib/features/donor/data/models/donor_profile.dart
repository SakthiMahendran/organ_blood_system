class DonorProfile {
  const DonorProfile({
    required this.id,
    required this.bloodGroup,
    required this.organWilling,
    required this.organTypes,
    this.lastBloodDonationDate,
    required this.availabilityStatus,
    required this.verificationStatus,
    this.medicalNotes,
    required this.city,
    required this.state,
    required this.updatedAt,
  });

  final int id;
  final String bloodGroup;
  final bool organWilling;
  final List<String> organTypes;
  final String? lastBloodDonationDate;
  final String availabilityStatus;
  final String verificationStatus;
  final String? medicalNotes;
  final String city;
  final String state;
  final String updatedAt;

  factory DonorProfile.fromJson(Map<String, dynamic> json) {
    return DonorProfile(
      id: (json['id'] as num?)?.toInt() ?? 0,
      bloodGroup: (json['blood_group'] ?? '').toString(),
      organWilling: json['organ_willing'] == true,
      organTypes: (json['organ_types'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(growable: false),
      lastBloodDonationDate: json['last_blood_donation_date']?.toString(),
      availabilityStatus: (json['availability_status'] ?? '').toString(),
      verificationStatus: (json['verification_status'] ?? '').toString(),
      medicalNotes: json['medical_notes']?.toString(),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      updatedAt: (json['updated_at'] ?? '').toString(),
    );
  }
}
