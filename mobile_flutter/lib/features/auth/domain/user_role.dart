enum UserRole {
  donor,
  acceptor,
  hospital,
  admin,
  unknown;

  static UserRole fromBackend(String? value) {
    switch ((value ?? '').toUpperCase()) {
      case 'DONOR':
        return UserRole.donor;
      case 'ACCEPTOR':
        return UserRole.acceptor;
      case 'HOSPITAL':
        return UserRole.hospital;
      case 'ADMIN':
        return UserRole.admin;
      default:
        return UserRole.unknown;
    }
  }

  String get backendValue {
    switch (this) {
      case UserRole.donor:
        return 'DONOR';
      case UserRole.acceptor:
        return 'ACCEPTOR';
      case UserRole.hospital:
        return 'HOSPITAL';
      case UserRole.admin:
        return 'ADMIN';
      case UserRole.unknown:
        return 'UNKNOWN';
    }
  }

  String get label {
    switch (this) {
      case UserRole.donor:
        return 'Donor';
      case UserRole.acceptor:
        return 'Acceptor';
      case UserRole.hospital:
        return 'Hospital';
      case UserRole.admin:
        return 'Admin';
      case UserRole.unknown:
        return 'Unknown';
    }
  }
}
