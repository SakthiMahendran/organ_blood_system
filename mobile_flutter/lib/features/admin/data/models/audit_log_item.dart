class AuditLogItem {
  const AuditLogItem({
    required this.id,
    this.actorEmail,
    required this.action,
    required this.entityType,
    required this.entityId,
    required this.createdAt,
  });

  final int id;
  final String? actorEmail;
  final String action;
  final String entityType;
  final int entityId;
  final String createdAt;

  factory AuditLogItem.fromJson(Map<String, dynamic> json) {
    return AuditLogItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      actorEmail: json['actor_email']?.toString(),
      action: (json['action'] ?? '').toString(),
      entityType: (json['entity_type'] ?? '').toString(),
      entityId: (json['entity_id'] as num?)?.toInt() ?? 0,
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}
