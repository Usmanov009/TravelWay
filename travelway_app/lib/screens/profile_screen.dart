import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/payment_card.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';
import '../utils/flaticon_icons.dart';
import '../widgets/notifications_dialog.dart';
import '../widgets/payment_cards_sheet.dart';
import '../widgets/telegram_login_sheet.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoggedIn = false;
  String _userName = 'Alisher Yusupov';
  String _userPhone = '+998 90 123 45 67';
  String _userId = 'TC-882109';
  String _userPassport = 'AA 1234567';
  bool _notifications = true;
  int _savedCardsCount = 0;
  bool _isLoading = true;

  static const String botUsername = 'sayrhub_bot';

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final loggedIn = prefs.getBool('sayrhub_is_logged_in') ?? false;
      final name = prefs.getString('sayrhub_user_name') ?? 'Alisher Yusupov';
      final phone =
          prefs.getString('sayrhub_user_phone') ?? '+998 90 123 45 67';
      final tcId = prefs.getString('sayrhub_user_id') ?? 'TC-882109';
      final passport =
          prefs.getString('sayrhub_user_passport') ?? 'AA 1234567';

      final cardsRaw = prefs.getString('sayrhub_user_payment_cards');
      int cardsCount = 0;
      if (cardsRaw != null && cardsRaw.isNotEmpty) {
        cardsCount = PaymentCard.decodeList(cardsRaw).length;
      }

      if (!mounted) return;
      setState(() {
        _isLoggedIn = loggedIn;
        _userName = name;
        _userPhone = phone;
        _userId = tcId;
        _userPassport = passport;
        _savedCardsCount = cardsCount;
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('sayrhub_is_logged_in', false);
    } catch (_) {}

    if (mounted) {
      setState(() {
        _isLoggedIn = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Hisobdan muvaffaqiyatli chiqildi'),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  void _openTelegramLogin() {
    TelegramLoginSheet.show(
      context,
      onLoginSuccess: (name, phone, tcId) {
        setState(() {
          _isLoggedIn = true;
          _userName = name;
          _userPhone = phone;
          _userId = tcId;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Xush kelibsiz, $name! Tizimga muvaffaqiyatli kirdingiz.',
            ),
            backgroundColor: AppTheme.accentGreen,
            duration: const Duration(seconds: 2),
          ),
        );
      },
    );
  }

  Future<void> _openTelegramSupport() async {
    final uri = Uri.parse('https://t.me/$botUsername');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Telegram ilovasini ochib bo\'lmadi. @sayrhub_bot orqali bog\'laning.',
            ),
          ),
        );
      }
    }
  }

  void _openPaymentCards() {
    PaymentCardsSheet.show(context).then((_) {
      _loadUserData();
    });
  }

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (parts.isNotEmpty && parts[0].isNotEmpty) {
      return parts[0].substring(0, parts[0].length >= 2 ? 2 : 1).toUpperCase();
    }
    return 'SH';
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppTheme.bgDark,
        body: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
        child: Column(
          children: [
            _isLoggedIn ? _buildLoggedInView(provider) : _buildLoggedOutView(),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final opened = await launchUrl(
                  Uri.parse('https://www.flaticon.com/uicons'),
                  mode: LaunchMode.externalApplication,
                );
                if (!opened && messenger.mounted) {
                  messenger.showSnackBar(
                    const SnackBar(
                      content: Text('Flaticon havolasini ochib bo‘lmadi'),
                    ),
                  );
                }
              },
              child: const Text('Uicons by Flaticon'),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // 1. INITIAL LOG IN VIEW (BIRINCHI MARTA OCHILGANDA)
  // ==========================================
  Widget _buildLoggedOutView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 20),

        // Brand Icon / Avatar
        Container(
          width: 86,
          height: 86,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primary, AppTheme.accentSky],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primary.withOpacity(0.35),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Center(
            child: Icon(
              FlaticonIcons.flightTakeoff,
              size: 44,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 20),

        const Text(
          'SayrHub hisobiga kirish',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppTheme.textMain,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 8),

        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Barcha xizmatlar, turlarni bron qilish, buyurtmalarni kuzatish va vaucherlarni olish uchun hisobingizga kiring.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.textSub,
              height: 1.4,
            ),
          ),
        ),
        const SizedBox(height: 28),

        // PROMINENT LOG IN BUTTON VIA TELEGRAM
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF229ED9), Color(0xFF1B77B7)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF229ED9).withOpacity(0.4),
                blurRadius: 14,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: _openTelegramLogin,
              borderRadius: BorderRadius.circular(16),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      FlaticonIcons.sendRounded,
                      color: Colors.white,
                      size: 22,
                    ),
                    SizedBox(width: 12),
                    Text(
                      'Log in (Telegram orqali)',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Telegram Bot details caption
        const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(FlaticonIcons.verified, size: 14, color: AppTheme.accentGreen),
            SizedBox(width: 6),
            Text(
              'Rasmiy bot: @sayrhub_bot',
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),

        // Benefits Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: Column(
            children: [
              _buildBenefitRow(
                FlaticonIcons.security,
                'Xavfsiz va tezkor',
                'Telegram orqali 1 ta bosish bilan oson autentifikatsiya',
              ),
              const Divider(height: 20, color: AppTheme.borderDark),
              _buildBenefitRow(
                FlaticonIcons.creditCard,
                'To\'lov kartalari',
                'Uzcard, Humo va Visa kartalari orqali tezkor to\'lov',
              ),
              const Divider(height: 20, color: AppTheme.borderDark),
              _buildBenefitRow(
                FlaticonIcons.supportAgent,
                'Doimiy aloqa',
                '24/7 operator yordami va vaucherlar xavfsizligi',
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // App Footer
        const Center(
          child: Column(
            children: [
              Text(
                'SayrHub Mobile v1.0.0',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
              ),
              SizedBox(height: 2),
              Text(
                'Powered by SayrHub Engine',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 10),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBenefitRow(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.subtleDark,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: AppTheme.primary),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: AppTheme.textMain,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // 2. LOGGED IN VIEW (KIRILGANDA)
  // ==========================================
  Widget _buildLoggedInView(AppProvider provider) {
    final initials = _getInitials(_userName);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. User Info Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppTheme.borderDark),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              // Avatar
              Stack(
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.primary, AppTheme.accentSky],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    padding: const EdgeInsets.all(2),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.subtleDark,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          initials,
                          style: const TextStyle(
                            color: AppTheme.primary,
                            fontSize: 19,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppTheme.surfaceDark,
                          width: 1.5,
                        ),
                      ),
                      child: const Text(
                        'PRO',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),

              // Name & Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _userName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textMain,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(
                          FlaticonIcons.verified,
                          size: 16,
                          color: AppTheme.primary,
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _userPhone,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSub,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          'ID: #$_userId',
                          style: const TextStyle(
                            fontSize: 10,
                            fontFamily: 'monospace',
                            color: AppTheme.textMuted,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          '✓ Tasdiqlangan',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppTheme.accentGreen,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // (NOTE: Cashback & Silver Sayohatchi card is COMPLETELY REMOVED per user request)

        // 2. Quick Stats Row (Barcha ma'lumotlar nollashtirilgan)
        Row(
          children: [
            _buildStatTile(
              '${provider.bookings.where((b) => b.type == 'active').length} ta',
              'Faol turlar',
              FlaticonIcons.luggageOutlined,
            ),
            const SizedBox(width: 10),
            _buildStatTile(
              '${provider.alerts.length} ta',
              'Narx signallari',
              FlaticonIcons.notificationsActiveOutlined,
            ),
            const SizedBox(width: 10),
            _buildStatTile(
              '0 mil',
              'Sayohat millari',
              FlaticonIcons.flightTakeoffOutlined,
            ),
          ],
        ),
        const SizedBox(height: 16),

        // 3. Settings Sections
        _buildSectionHeader('SOZLAMALAR VA HISOB'),
        const SizedBox(height: 8),

        Container(
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: Column(
            children: [
              _buildSettingItem(
                icon: FlaticonIcons.personOutline,
                title: 'Shaxsiy ma\'lumotlar',
                subtitle: '$_userName • $_userPhone',
                onTap: () {
                  _showPersonalInfoDialog();
                },
              ),
              const Divider(height: 1, indent: 56),
              _buildSettingItem(
                icon: FlaticonIcons.badgeOutlined,
                title: 'Pasport ma\'lumotlari',
                subtitle: '$_userPassport • O\'zbekiston',
                onTap: () {
                  _showPassportDialog();
                },
              ),
              const Divider(height: 1, indent: 56),
              _buildSettingItem(
                icon: FlaticonIcons.creditCardOutlined,
                title: 'To\'lov kartalari',
                subtitle: _savedCardsCount > 0
                    ? '$_savedCardsCount ta karta ulangan'
                    : 'Uzcard, Humo, Visa',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_savedCardsCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$_savedCardsCount ta',
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppTheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    const SizedBox(width: 6),
                    const Icon(
                      FlaticonIcons.arrowForwardIos,
                      size: 12,
                      color: AppTheme.textMuted,
                    ),
                  ],
                ),
                onTap: _openPaymentCards,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        _buildSectionHeader('TIZIM VA XIZMATLAR'),
        const SizedBox(height: 8),

        Container(
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: Column(
            children: [
              // Notifications Toggle & Open
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.subtleDark,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    FlaticonIcons.notificationsNone,
                    size: 18,
                    color: AppTheme.textSub,
                  ),
                ),
                title: const Text(
                  'Bildirishnomalar',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: AppTheme.textMain,
                  ),
                ),
                subtitle: const Text(
                  'Barcha bildirishnomalarni ko\'rish',
                  style: TextStyle(fontSize: 11, color: AppTheme.textSub),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Switch(
                      value: _notifications,
                      activeColor: AppTheme.primary,
                      onChanged: (val) => setState(() => _notifications = val),
                    ),
                  ],
                ),
                onTap: () {
                  NotificationsModal.show(context);
                },
              ),
              const Divider(height: 1, indent: 56),

              _buildSettingItem(
                icon: FlaticonIcons.language,
                title: 'Ilova tili',
                subtitle: 'O\'zbekcha (UZ)',
                onTap: () {},
              ),
              const Divider(height: 1, indent: 56),

              _buildSettingItem(
                icon: FlaticonIcons.supportAgent,
                title: 'Telegram Operator & Yordam',
                subtitle: '@$botUsername',
                onTap: _openTelegramSupport,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Log out button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _logout,
            icon: const Icon(
              FlaticonIcons.logout,
              size: 16,
              color: Colors.redAccent,
            ),
            label: const Text(
              'Hisobdan chiqish',
              style: TextStyle(
                color: Colors.redAccent,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.redAccent, width: 1),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // App Version Footer
        const Center(
          child: Column(
            children: [
              Text(
                'SayrHub Mobile v1.0.0',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
              ),
              SizedBox(height: 2),
              Text(
                'Powered by SayrHub Engine',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 10),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showPersonalInfoDialog() {
    final nameController = TextEditingController(text: _userName);
    final phoneController = TextEditingController(text: _userPhone);
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Shaxsiy Ma\'lumotlarni Tahrirlash',
          style: TextStyle(
            color: AppTheme.textMain,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Name field - only letters
                TextFormField(
                  controller: nameController,
                  textCapitalization: TextCapitalization.words,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(
                      RegExp(r"[a-zA-Z\u00C0-\u024F\u2019'`ʻʼ\- ]"),
                    ),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'Ism va Familiya',
                    hintText: 'Masalan: Alisher Yusupov',
                    prefixIcon: Icon(Icons.person_outline, size: 20),
                  ),
                  validator: (value) {
                    final v = value?.trim() ?? '';
                    if (v.isEmpty) {
                      return 'Ism va familiyani kiriting';
                    }
                    if (v.length < 3) {
                      return 'Kamida 3 ta belgi';
                    }
                    if (!RegExp(r"^[a-zA-Z\u00C0-\u024F\u2019'`ʻʼ\- ]+$")
                        .hasMatch(v)) {
                      return "Faqat harflar, bo'sh joy va - belgilari";
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                // Phone field - format +998 XX XXX XX XX
                TextFormField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(12), // 998 + 9 digits
                    _PhoneNumberFormatter(),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'Telefon raqam',
                    hintText: '+998 XX XXX XX XX',
                    prefixIcon: Icon(Icons.phone_outlined, size: 20),
                    prefixText: '+998 ',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Telefon raqamini kiriting';
                    }
                    final digits = value.replaceAll(RegExp(r'\D'), '');
                    if (digits.length < 9) {
                      return 'To\'liq raqam kiriting (9 ta raqam)';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'Bekor qilish',
              style: TextStyle(color: AppTheme.textMuted),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                await _savePersonalInfo(nameController.text.trim(), phoneController.text.trim());
                if (mounted) Navigator.of(context).pop();
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Saqlash', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _savePersonalInfo(String name, String phone) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('sayrhub_user_name', name);
      await prefs.setString('sayrhub_user_phone', phone);
      if (!mounted) return;
      setState(() {
        _userName = name;
        _userPhone = phone;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ma\'lumotlar saqlandi'),
          backgroundColor: AppTheme.accentGreen,
          duration: Duration(seconds: 2),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Xatolik yuz berdi'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
    }
  }

  void _showPassportDialog() {
    final passportController = TextEditingController(text: _userPassport);
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Pasport Ma\'lumotlarini Tahrirlash',
          style: TextStyle(
            color: AppTheme.textMain,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: passportController,
                textCapitalization: TextCapitalization.characters,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9\s]')),
                  LengthLimitingTextInputFormatter(10), // AA 1234567 = 10 chars with space
                  _PassportFormatter(),
                ],
                decoration: const InputDecoration(
                  labelText: 'Pasport seriya va raqam',
                  hintText: 'AA 1234567',
                  prefixIcon: Icon(Icons.badge_outlined, size: 20),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Pasport ma\'lumotlarini kiriting';
                  }
                  // Format: 2 letters + 7 digits (with optional space)
                  final cleaned = value.replaceAll(' ', '').toUpperCase();
                  if (!RegExp(r'^[A-Z]{2}\d{7}$').hasMatch(cleaned)) {
                    return 'Format: 2 harf + 7 raqam (masalan: AA1234567)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              const Text(
                'Format: 2 ta katta harf (avtomatik) + 7 ta raqam\nMisol: AA 1234567',
                style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Bekor qilish', style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                await _savePassportInfo(passportController.text.trim());
                if (mounted) Navigator.of(context).pop();
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Saqlash', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _savePassportInfo(String passport) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      // Save formatted: AA 1234567
      final cleaned = passport.replaceAll(' ', '').toUpperCase();
      final formatted = '${cleaned.substring(0, 2)} ${cleaned.substring(2)}';
      await prefs.setString('sayrhub_user_passport', formatted);
      if (!mounted) return;
      setState(() => _userPassport = formatted);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pasport ma\'lumotlari saqlandi'),
          backgroundColor: AppTheme.accentGreen,
          duration: Duration(seconds: 2),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Xatolik yuz berdi'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
    }
  }

  Widget _buildStatTile(String value, String label, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderDark),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: AppTheme.primary),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.textMain,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 9, color: AppTheme.textSub),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: AppTheme.textMuted,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.subtleDark,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: AppTheme.textSub),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 13,
            color: AppTheme.textMain,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
        ),
        trailing:
            trailing ??
            const Icon(
              FlaticonIcons.arrowForwardIos,
              size: 12,
              color: AppTheme.textMuted,
            ),
        onTap: onTap,
      ),
    );
  }
}

class _PhoneNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return newValue;
    
    String formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 5) {
      formatted = '${digits.substring(0, 2)} ${digits.substring(2)}';
    } else if (digits.length <= 7) {
      formatted = '${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}';
    } else {
      formatted = '${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 7)} ${digits.substring(7, digits.length > 9 ? 9 : digits.length)}';
    }
    
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class _PassportFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final raw = newValue.text.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    if (raw.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }

    final buffer = StringBuffer();
    for (final ch in raw.split('')) {
      if (buffer.length < 2) {
        if (RegExp(r'[A-Z]').hasMatch(ch)) buffer.write(ch);
      } else if (buffer.length < 9) {
        if (RegExp(r'[0-9]').hasMatch(ch)) buffer.write(ch);
      } else {
        break;
      }
    }

    final cleaned = buffer.toString();
    String formatted;
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else {
      formatted = '${cleaned.substring(0, 2)} ${cleaned.substring(2)}';
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
