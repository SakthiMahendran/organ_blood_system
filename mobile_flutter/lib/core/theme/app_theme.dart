import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;

    const primary = Color(0xFF0B6E99);
    final secondary =
        isDark ? const Color(0xFF2BBE9A) : const Color(0xFF00A878);
    final background =
        isDark ? const Color(0xFF071120) : const Color(0xFFF3F7FB);
    final surface = isDark ? const Color(0xFF11243A) : Colors.white;
    final onSurface =
        isDark ? const Color(0xFFE7EEF9) : const Color(0xFF0F1C2F);

    final colorScheme = ColorScheme.fromSeed(
      seedColor: primary,
      primary: primary,
      secondary: secondary,
      surface: surface,
      brightness: brightness,
    );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: background,
      snackBarTheme:
          const SnackBarThemeData(behavior: SnackBarBehavior.floating),
    );

    return base.copyWith(
      textTheme: GoogleFonts.manropeTextTheme(base.textTheme).copyWith(
        headlineSmall:
            GoogleFonts.manrope(fontWeight: FontWeight.w800, fontSize: 26),
        titleLarge: GoogleFonts.manrope(fontWeight: FontWeight.w700),
        titleMedium: GoogleFonts.manrope(fontWeight: FontWeight.w700),
        bodyLarge: GoogleFonts.manrope(fontWeight: FontWeight.w500),
        bodyMedium: GoogleFonts.manrope(fontWeight: FontWeight.w500),
      ),
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: onSurface,
        titleTextStyle: GoogleFonts.manrope(
          color: onSurface,
          fontWeight: FontWeight.w800,
          fontSize: 22,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(
            color: isDark
                ? const Color(0xFF5E87B3).withValues(alpha: 0.18)
                : const Color(0xFF0B6E99).withValues(alpha: 0.08),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? const Color(0xFF1A314A) : Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
              color: isDark ? const Color(0xFF35506D) : Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
              color: isDark ? const Color(0xFF35506D) : Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primary, width: 1.2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFC7332F), width: 1.2),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(50),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle:
              GoogleFonts.manrope(fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle:
              GoogleFonts.manrope(fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          textStyle:
              GoogleFonts.manrope(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 74,
        indicatorColor: primary.withValues(alpha: isDark ? 0.28 : 0.16),
        backgroundColor: isDark ? const Color(0xFF0E1F33) : Colors.white,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final isSelected = states.contains(WidgetState.selected);
          return GoogleFonts.manrope(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected
                ? (isDark ? const Color(0xFF9BD4F0) : primary)
                : (isDark ? const Color(0xFFAFC0D4) : const Color(0xFF3C4B61)),
          );
        }),
      ),
    );
  }
}
