import 'package:intl/intl.dart';

class AppFormatters {
  const AppFormatters._();

  static String date(String? value) {
    if (value == null || value.isEmpty) return '-';
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;
    return DateFormat.yMMMd().format(parsed);
  }

  static String dateTime(String? value) {
    if (value == null || value.isEmpty) return '-';
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;
    return DateFormat('dd MMM yyyy, hh:mm a').format(parsed);
  }
}
