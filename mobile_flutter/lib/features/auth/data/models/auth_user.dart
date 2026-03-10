import '../../domain/user_role.dart';

class AuthUser {
  const AuthUser({
    required this.id,
    required this.username,
    required this.email,
    required this.phone,
    required this.userType,
    required this.isActive,
    this.address,
    this.city,
    this.state,
    this.bloodGroup,
  });

  final int id;
  final String username;
  final String email;
  final String? phone;
  final UserRole userType;
  final bool isActive;
  final String? address;
  final String? city;
  final String? state;
  final String? bloodGroup;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: (json['id'] as num?)?.toInt() ?? 0,
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: json['phone']?.toString(),
      userType: UserRole.fromBackend(json['user_type']?.toString()),
      isActive: json['is_active'] == true,
      address: json['address']?.toString(),
      city: json['city']?.toString(),
      state: json['state']?.toString(),
      bloodGroup: json['blood_group']?.toString(),
    );
  }
}
