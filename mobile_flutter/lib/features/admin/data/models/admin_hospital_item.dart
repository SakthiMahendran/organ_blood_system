class AdminHospitalItem {
  const AdminHospitalItem({
    required this.id,
    required this.name,
    required this.licenseId,
    required this.city,
    required this.state,
    required this.approvalStatus,
    required this.createdAt,
  });

  final int id;
  final String name;
  final String licenseId;
  final String city;
  final String state;
  final String approvalStatus;
  final String createdAt;

  factory AdminHospitalItem.fromJson(Map<String, dynamic> json) {
    return AdminHospitalItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? '').toString(),
      licenseId: (json['license_id'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      approvalStatus: (json['approval_status'] ?? '').toString(),
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}
