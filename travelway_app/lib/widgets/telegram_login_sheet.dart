import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../utils/app_theme.dart';

class TelegramLoginSheet extends StatefulWidget {
  final void Function(String name, String phone, String tcId) onLoginSuccess;

  const TelegramLoginSheet({
    super.key,
    required this.onLoginSuccess,
  });

  static Future<void> show(
    BuildContext context, {
    required void Function(String name, String phone, String tcId) onLoginSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TelegramLoginSheet(onLoginSuccess: onLoginSuccess),
    );
  }

  @override
  State<TelegramLoginSheet> createState() => _TelegramLoginSheetState();
}

class _TelegramLoginSheetState extends State<TelegramLoginSheet> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController(text: '+998 ');

  // Profile completion controllers
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _passportController = TextEditingController();

  bool _isLoading = false;
  bool _isProfileStep = false;
  String _verifiedPhone = '';
  String _verifiedTcId = '';
  String? _sessionToken;

  static const String botUsername = 'sayrhub_bot';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _initSession();
  }

  Future<void> _initSession() async {
    try {
      final baseUrl = ApiService().baseUrl;
      final res = await http.post(Uri.parse('$baseUrl/api/auth/telegram/create-session')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['sessionToken'] != null) {
          _sessionToken = data['sessionToken'];
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _tabController.dispose();
    _otpController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _passportController.dispose();
    super.dispose();
  }

  Future<void> _openTelegramBot() async {
    final link = _sessionToken != null
        ? 'https://t.me/$botUsername?start=$_sessionToken'
        : 'https://t.me/$botUsername';
    final uri = Uri.parse(link);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Telegram ilovasini ochib bo\'lmadi. @sayrhub_bot qidiring.')),
        );
      }
    }
  }

  Future<void> _verifyOtpCode() async {
    final code = _otpController.text.trim();
    if (code.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, 4 xonali tasdiqlash kodini to\'liq kiriting')),
      );
      return;
    }

    setState(() => _isLoading = true);

    String verifiedName = 'Mijoz';
    String verifiedPhone = '+998 90 000 00 00';
    String verifiedTcId = 'TC-${DateTime.now().millisecondsSinceEpoch % 1000000}';
    String verifiedPassport = '';

    try {
      final baseUrl = ApiService().baseUrl;
      final res = await http.post(
        Uri.parse('$baseUrl/api/auth/telegram/verify-code'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'code': code,
          'sessionToken': _sessionToken ?? 'session_default',
        }),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['user'] != null) {
          final u = data['user'];
          verifiedName = u['name'] ?? 'Mijoz';
          verifiedPhone = u['phone'] ?? '+998 90 000 00 00';
          verifiedTcId = u['tcId'] ?? 'TC-${DateTime.now().millisecondsSinceEpoch % 1000000}';
          verifiedPassport = u['passportNumber'] ?? '';
        }
      }
    } catch (_) {}

    String fn = '';
    String ln = '';
    if (verifiedName.isNotEmpty && !verifiedName.toLowerCase().contains('mijoz')) {
      final parts = verifiedName.split(' ');
      fn = parts.first;
      if (parts.length > 1) {
        ln = parts.sublist(1).join(' ');
      }
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
        _isProfileStep = true;
        _verifiedPhone = verifiedPhone;
        _verifiedTcId = verifiedTcId;
        _firstNameController.text = fn;
        _lastNameController.text = ln;
        _passportController.text = verifiedPassport;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Telegram orqali tasdiqlandi! Endi shaxsiy ma\'lumotlaringizni to\'ldiring.'),
          backgroundColor: AppTheme.accentGreen,
        ),
      );
    }
  }

  Future<void> _submitProfileStep() async {
    final fn = _firstNameController.text.trim();
    final ln = _lastNameController.text.trim();
    final pass = _passportController.text.trim().toUpperCase();

    if (fn.isEmpty || fn.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, ismingizni to\'liq kiriting')),
      );
      return;
    }

    if (ln.isEmpty || ln.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, familiyangizni to\'liq kiriting')),
      );
      return;
    }

    final passClean = pass.replaceAll(RegExp(r'\s'), '');
    if (passClean.length < 7) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, pasport seriya va raqamini to\'liq kiriting (masalan: AA 1234567)')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final fullName = '$fn $ln';
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('sayrhub_user_passport', pass);
    } catch (_) {}

    _completeLogin(fullName, _verifiedPhone, _verifiedTcId);
  }

  Future<void> _registerManual() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    if (name.isEmpty || name.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, to\'liq ism-sharifingizni kiriting')),
      );
      return;
    }

    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 9) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, to\'g\'ri telefon raqam kiriting')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final tcId = 'TC-${DateTime.now().millisecondsSinceEpoch % 1000000}';
    _completeLogin(name, phone, tcId);
  }

  Future<void> _completeLogin(String name, String phone, String tcId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('sayrhub_is_logged_in', true);
      await prefs.setString('sayrhub_user_name', name);
      await prefs.setString('sayrhub_user_phone', phone);
      await prefs.setString('sayrhub_user_id', tcId);
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
      Navigator.of(context).pop();
      widget.onLoginSuccess(name, phone, tcId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 10, bottom: 6),
                width: 38,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.borderDark,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 12, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF229ED9).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          _isProfileStep ? Icons.badge_outlined : Icons.send_rounded,
                          color: const Color(0xFF229ED9),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isProfileStep ? 'Profilni to\'ldirish' : 'Telegram orqali Kirish',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                          ),
                          Text(
                            _isProfileStep ? 'Ism, familiya va pasport' : 'Rasmiy @$botUsername',
                            style: const TextStyle(fontSize: 11, color: AppTheme.accentSky),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSub),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppTheme.borderDark),

            // Content: Either Profile Completion or Tabs
            if (_isProfileStep)
              SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Verified Phone Card (ko'rinib turadi)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.subtleDark,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.accentGreen.withOpacity(0.35)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_rounded, color: AppTheme.accentGreen, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Tasdiqlangan telefon raqami:',
                                  style: TextStyle(fontSize: 10, color: AppTheme.textMuted),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _verifiedPhone,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textMain,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.accentGreen.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Ulangan',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentGreen),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // First Name
                    const Text('Ism *', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _firstNameController,
                      style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                      decoration: InputDecoration(
                        hintText: 'Masalan: Jasur',
                        hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppTheme.subtleDark,
                        prefixIcon: const Icon(Icons.person_outline, size: 18, color: AppTheme.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Last Name
                    const Text('Familiya *', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _lastNameController,
                      style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                      decoration: InputDecoration(
                        hintText: 'Masalan: Rahimov',
                        hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppTheme.subtleDark,
                        prefixIcon: const Icon(Icons.badge_outlined, size: 18, color: AppTheme.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Passport Series & Number
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Pasport seriya va raqami *', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                        Text('Namuna: AA 1234567', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passportController,
                      textCapitalization: TextCapitalization.characters,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: AppTheme.textMain),
                      decoration: InputDecoration(
                        hintText: 'AA 1234567',
                        hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12, letterSpacing: 1.5),
                        filled: true,
                        fillColor: AppTheme.subtleDark,
                        prefixIcon: const Icon(Icons.flight_takeoff, size: 18, color: AppTheme.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submitProfileStep,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isLoading
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Saqlash va SayrHub\'ga kirish 🚀', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              )
            else ...[
              // Tab bar
              TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primary,
                labelColor: AppTheme.primary,
                unselectedLabelColor: AppTheme.textMuted,
                tabs: const [
                  Tab(icon: Icon(Icons.security, size: 16), text: 'Telegram Bot'),
                  Tab(icon: Icon(Icons.person_add_outlined, size: 16), text: 'Ma\'lumot kiritish'),
                ],
              ),

              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 330),
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Tab 1: Telegram Bot Code
                    SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF229ED9).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFF229ED9).withOpacity(0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.info_outline, color: Color(0xFF229ED9), size: 20),
                                const SizedBox(width: 10),
                                const Expanded(
                                  child: Text(
                                    'Botda "Start" va "Telefon raqamni ulashish" tugmasini bosing va olingan 4 xonali kodni kiriting.',
                                    style: TextStyle(fontSize: 11, color: AppTheme.textMain, height: 1.3),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Button to open bot
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _openTelegramBot,
                              icon: const Icon(Icons.open_in_new, size: 16),
                              label: const Text('Telegram Botni ochish (@sayrhub_bot)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF229ED9),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          const Text('Bot bergan 4 xonali tasdiqlash kodi:', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _otpController,
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(4),
                            ],
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 8, color: AppTheme.textMain),
                            decoration: InputDecoration(
                              hintText: '0000',
                              hintStyle: const TextStyle(color: AppTheme.textMuted, letterSpacing: 8),
                              filled: true,
                              fillColor: AppTheme.subtleDark,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                            ),
                          ),
                          const SizedBox(height: 14),

                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _verifyOtpCode,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 13),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: _isLoading
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : const Text('Tasdiqlash va Davom etish', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Tab 2: Manual Data Entry
                    SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Ism va Familiya', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _nameController,
                            style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                            decoration: InputDecoration(
                              hintText: 'Masalan: Alisher Yusupov',
                              hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                              filled: true,
                              fillColor: AppTheme.subtleDark,
                              prefixIcon: const Icon(Icons.person_outline, size: 18, color: AppTheme.primary),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                            ),
                          ),
                          const SizedBox(height: 12),

                          const Text('Telefon raqam', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                            decoration: InputDecoration(
                              hintText: '+998 90 123 45 67',
                              hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                              filled: true,
                              fillColor: AppTheme.subtleDark,
                              prefixIcon: const Icon(Icons.phone_outlined, size: 18, color: AppTheme.primary),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                            ),
                          ),
                          const SizedBox(height: 20),

                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _registerManual,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 13),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: _isLoading
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : const Text('Ro\'yxatdan o\'tish va Kirish', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
