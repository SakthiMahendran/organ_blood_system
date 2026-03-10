class AdminUserItem {
  const AdminUserItem({
    required this.id,
    required this.username,
    required this.email,
    this.phone,
    required this.userType,
    required this.isActive,
    required this.createdAt,
  });

  final int id;
  final String username;
  final String email;
  final String? phone;
  final String userType;
  final bool isActive;
  final String createdAt;

  factory AdminUserItem.fromJson(Map<String, dynamic> json) {
    return AdminUserItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: json['phone']?.toString(),
      userType: (json['user_type'] ?? '').toString(),
      isActive: json['is_active'] == true,
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}
