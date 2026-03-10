class AppValidators {
  const AppValidators._();

  static String? requiredField(String? value,
      {String fieldName = 'This field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  static String? email(String? value) {
    final required = requiredField(value, fieldName: 'Email');
    if (required != null) return required;

    final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!regex.hasMatch(value!.trim())) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? password(String? value) {
    final required = requiredField(value, fieldName: 'Password');
    if (required != null) return required;
    if (value!.trim().length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  }

  static String? phone(String? value) {
    final required = requiredField(value, fieldName: 'Phone');
    if (required != null) return required;

    final regex = RegExp(r'^[0-9+\-()\s]{7,15}$');
    if (!regex.hasMatch(value!.trim())) {
      return 'Enter a valid phone number';
    }
    return null;
  }
}
