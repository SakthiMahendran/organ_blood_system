import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.label});

  final String label;

  Color _chipColor(String upper) {
    // Check INACTIVE before ACTIVE — 'INACTIVE' contains 'ACTIVE' as a substring.
    if (upper.contains('REJECTED') ||
        upper.contains('DECLINED') ||
        upper.contains('CANCELLED') ||
        upper.contains('SUSPENDED') ||
        upper.contains('INACTIVE')) {
      return const Color(0xFFC7332F);
    }
    if (upper.contains('FULFILLED') ||
        upper.contains('APPROVED') ||
        upper.contains('VERIFIED') ||
        upper.contains('ACTIVE')) {
      return const Color(0xFF1B8F4C);
    }
    if (upper.contains('PENDING') || upper.contains('MATCHING')) {
      return const Color(0xFFD98100);
    }
    return const Color(0xFF4F6078);
  }

  @override
  Widget build(BuildContext context) {
    final upper = label.toUpperCase();
    final color = _chipColor(upper);

    return Chip(
      label: Text(label),
      visualDensity: VisualDensity.compact,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      backgroundColor: color.withValues(alpha: 0.12),
      side: BorderSide(color: color.withValues(alpha: 0.28)),
      labelStyle: TextStyle(color: color, fontWeight: FontWeight.w700),
    );
  }
}
