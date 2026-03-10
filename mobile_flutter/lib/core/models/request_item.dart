class RequestItem {
  const RequestItem({
    required this.id,
    required this.requestType,
    this.bloodGroup,
    this.organType,
    this.unitsNeeded,
    this.requiredDate,
    required this.urgency,
    required this.city,
    required this.state,
    this.hospital,
    required this.status,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final String requestType;
  final String? bloodGroup;
  final String? organType;
  final int? unitsNeeded;
  final String? requiredDate;
  final String urgency;
  final String city;
  final String state;
  final int? hospital;
  final String status;
  final String? notes;
  final String createdAt;
  final String updatedAt;

  factory RequestItem.fromJson(Map<String, dynamic> json) {
    return RequestItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      requestType: (json['request_type'] ?? '').toString(),
      bloodGroup: json['blood_group']?.toString(),
      organType: json['organ_type']?.toString(),
      unitsNeeded: (json['units_needed'] as num?)?.toInt(),
      requiredDate: json['required_date']?.toString(),
      urgency: (json['urgency'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      hospital: (json['hospital'] as num?)?.toInt(),
      status: (json['status'] ?? '').toString(),
      notes: json['notes']?.toString(),
      createdAt: (json['created_at'] ?? '').toString(),
      updatedAt: (json['updated_at'] ?? '').toString(),
    );
  }
}
