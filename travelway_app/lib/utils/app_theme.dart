import 'package:flutter/material.dart';

class AppTheme {
  // Web-aligned Palette tokens
  static const Color primary = Color(0xFFFF5B00);
  static const Color primaryDark = Color(0xFFE04E00);
  static const Color accent = Color(0xFFFF5B00);
  static const Color accentLight = Color(0x26FF5B00);
  static const Color accentSky = Color(0xFF38BDF8);
  static const Color secondary = Color(0xFF00D2D3);

  // Backgrounds matching Web CSS tokens
  static const Color bgDark = Color(0xFF0F172A); // --tw-canvas
  static const Color surfaceDark = Color(0xFF1E293B); // --tw-surface
  static const Color subtleDark = Color(0xFF253349); // --tw-subtle
  static const Color cardDark = Color(0xFF1E293B);
  static const Color borderDark = Color(0xFF334155); // --tw-border
  static const Color borderHover = Color(0xFF475569);

  // Typography colors matching Web CSS tokens
  static const Color textMain = Color(0xFFF1F5F9); // --tw-text-main
  static const Color textSub = Color(0xFF94A3B8); // --tw-text-sub
  static const Color textMuted = Color(0xFF64748B); // --tw-text-muted

  // Status & Badges
  static const Color accentGreen = Color(0xFF10B981);
  static const Color accentGold = Color(0xFFF59E0B);
  static const Color accentRed = Color(0xFFEF4444);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: accentSky,
        surface: surfaceDark,
        error: accentRed,
        onPrimary: Colors.white,
        onSurface: textMain,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceDark,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          color: textMain,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.2,
        ),
        iconTheme: IconThemeData(color: textMain),
      ),
      cardTheme: CardThemeData(
        color: surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderDark, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textMain,
          side: const BorderSide(color: borderDark),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: subtleDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: const TextStyle(color: textMuted, fontSize: 13),
      ),
      dividerTheme: const DividerThemeData(
        color: borderDark,
        thickness: 1,
        space: 20,
      ),
    );
  }
}
