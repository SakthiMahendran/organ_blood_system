class BloodDetectionResult {
  const BloodDetectionResult({
    required this.bloodGroup,
    required this.confidence,
    required this.summary,
    required this.disclaimer,
    required this.inputType,
    required this.sourceLabel,
  });

  final String bloodGroup;
  final double confidence;
  final String summary;
  final String disclaimer;
  final String inputType;
  final String sourceLabel;

  factory BloodDetectionResult.fromJson(Map<String, dynamic> json) {
    return BloodDetectionResult(
      bloodGroup:
          (json['blood_group'] ?? json['result'] ?? 'Unknown').toString(),
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0,
      summary:
          (json['summary'] ?? 'Prototype prediction generated.').toString(),
      disclaimer: (json['disclaimer'] ??
              'Prototype output only. Do not use for medical decisions.')
          .toString(),
      inputType: (json['input_type'] ?? 'text').toString(),
      sourceLabel: (json['source_label'] ?? json['source'] ?? '').toString(),
    );
  }
}
