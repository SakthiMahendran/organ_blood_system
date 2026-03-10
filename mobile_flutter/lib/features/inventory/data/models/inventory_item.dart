class InventoryItem {
  const InventoryItem({
    required this.bloodGroup,
    required this.units,
    required this.threshold,
    required this.updatedAt,
  });

  final String bloodGroup;
  final int units;
  final int threshold;
  final String updatedAt;

  bool get isLow => units <= threshold;

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      bloodGroup: (json['blood_group'] ?? json['group'] ?? '').toString(),
      units: (json['units'] as num?)?.toInt() ?? 0,
      threshold: (json['threshold'] as num?)?.toInt() ?? 0,
      updatedAt: (json['updated_at'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'blood_group': bloodGroup,
      'units': units,
      'threshold': threshold,
      'updated_at': updatedAt,
    };
  }
}
