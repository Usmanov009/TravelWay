import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/payment_card.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';
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
  bool _notifications = true;
  int _savedCardsCount = 0;
  bool _isLoading = true;

  static const String botUsername = 'mytravelwaybot';

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
      final phone = prefs.getString('sayrhub_user_phone') ?? '+998 90 123 45 67';
      final tcId = prefs.getString('sayrhub_user_id') ?? 'TC-882109';

      final cardsRaw = prefs.getString('sayrhub_user_payment_cards');
      int cardsCount = 0;
      if (cardsRaw != null && cardsRaw.isNotEmpty) {
        cardsCount = PaymentCard.decodeList(cardsRaw).length;
      }

      if (mounted) {
        setState(() {
          _isLoggedIn = loggedIn;
          _userName = name;
          _userPhone = phone;
          _userId = tcId;
          _savedCardsCount = cardsCount;
          _isLoading = false;
        });
      }
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
        const SnackBar(content: Text('Hisobdan muvaffaqiyatli chiqildi'), duration: Duration(seconds: 1)),
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
            content: Text('Xush kelibsiz, $name! Tizimga muvaffaqiyatli kirdingiz.'),
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
          const SnackBar(content: Text('Telegram ilovasini ochib bo\'lmadi. @mytravelwaybot orqali bog\'laning.')),
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
        child: _isLoggedIn
            ? _buildLoggedInView(provider)
            : _buildLoggedOutView(),
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
            child: Icon(Icons.flight_takeoff, size: 44, color: Colors.white),
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
                    Icon(Icons.send_rounded, color: Colors.white, size: 22),
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
            Icon(Icons.verified, size: 14, color: AppTheme.accentGreen),
            SizedBox(width: 6),
            Text(
              'Rasmiy bot: @mytravelwaybot',
              style: TextStyle(fontSize: 12, color: AppTheme.textMuted, fontWeight: FontWeight.w600),
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
              _buildBenefitRow(Icons.security, 'Xavfsiz va tezkor', 'Telegram orqali 1 ta bosish bilan oson autentifikatsiya'),
              const Divider(height: 20, color: AppTheme.borderDark),
              _buildBenefitRow(Icons.credit_card, 'To\'lov kartalari', 'Uzcard, Humo va Visa kartalari orqali tezkor to\'lov'),
              const Divider(height: 20, color: AppTheme.borderDark),
              _buildBenefitRow(Icons.support_agent, 'Doimiy aloqa', '24/7 operator yordami va vaucherlar xavfsizligi'),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // App Footer
        const Center(
          child: Column(
            children: [
              Text('SayrHub Mobile v1.0.0', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              SizedBox(height: 2),
              Text('Powered by SayrHub Engine', style: TextStyle(color: AppTheme.textMuted, fontSize: 10)),
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
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSub)),
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
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.surfaceDark, width: 1.5),
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
                        const Icon(Icons.verified, size: 16, color: AppTheme.primary),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _userPhone,
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSub),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          'ID: #$_userId',
                          style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: AppTheme.textMuted),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          '✓ Tasdiqlangan',
                          style: TextStyle(fontSize: 10, color: AppTheme.accentGreen, fontWeight: FontWeight.bold),
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
              Icons.luggage_outlined,
            ),
            const SizedBox(width: 10),
            _buildStatTile(
              '${provider.alerts.length} ta',
              'Narx signallari',
              Icons.notifications_active_outlined,
            ),
            const SizedBox(width: 10),
            _buildStatTile(
              '0 mil',
              'Sayohat millari',
              Icons.flight_takeoff_outlined,
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
                icon: Icons.person_outline,
                title: 'Shaxsiy ma\'lumotlar',
                subtitle: '$_userName • $_userPhone',
                onTap: () {
                  _showPersonalInfoDialog();
                },
              ),
              const Divider(height: 1, indent: 56),
              _buildSettingItem(
                icon: Icons.badge_outlined,
                title: 'Pasport ma\'lumotlari',
                subtitle: 'AA 1234567 • O\'zbekiston',
                onTap: () {
                  _showPassportDialog();
                },
              ),
              const Divider(height: 1, indent: 56),
              _buildSettingItem(
                icon: Icons.credit_card_outlined,
                title: 'To\'lov kartalari',
                subtitle: _savedCardsCount > 0 ? '$_savedCardsCount ta karta ulangan' : 'Uzcard, Humo, Visa',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_savedCardsCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$_savedCardsCount ta',
                          style: const TextStyle(fontSize: 10, color: AppTheme.primary, fontWeight: FontWeight.bold),
                        ),
                      ),
                    const SizedBox(width: 6),
                    const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.textMuted),
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
                  child: const Icon(Icons.notifications_none, size: 18, color: AppTheme.textSub),
                ),
                title: const Text('Bildirishnomalar', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppTheme.textMain)),
                subtitle: const Text('Barcha bildirishnomalarni ko\'rish', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
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
                icon: Icons.language,
                title: 'Ilova tili',
                subtitle: 'O\'zbekcha (UZ)',
                onTap: () {},
              ),
              const Divider(height: 1, indent: 56),

              _buildSettingItem(
                icon: Icons.support_agent,
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
            icon: const Icon(Icons.logout, size: 16, color: Colors.redAccent),
            label: const Text('Hisobdan chiqish', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.redAccent, width: 1),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // App Version Footer
        const Center(
          child: Column(
            children: [
              Text('SayrHub Mobile v1.0.0', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              SizedBox(height: 2),
              Text('Powered by SayrHub Engine', style: TextStyle(color: AppTheme.textMuted, fontSize: 10)),
            ],
          ),
        ),
      ],
    );
  }

  void _showPersonalInfoDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Shaxsiy Ma\'lumotlar', style: TextStyle(color: AppTheme.textMain, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDialogRow('Ism:', _userName),
            const SizedBox(height: 8),
            _buildDialogRow('Telefon:', _userPhone),
            const SizedBox(height: 8),
            _buildDialogRow('ID:', '#$_userId'),
            const SizedBox(height: 8),
            _buildDialogRow('Holat:', 'Tasdiqlangan'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Yopish', style: TextStyle(color: AppTheme.primary)),
          ),
        ],
      ),
    );
  }

  void _showPassportDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Pasport Ma\'lumotlari', style: TextStyle(color: AppTheme.textMain, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDialogRow('Seriya & Raqam:', 'AA 1234567'),
            const SizedBox(height: 8),
            _buildDialogRow('Fuqarolik:', 'O\'zbekiston'),
            const SizedBox(height: 8),
            _buildDialogRow('Amal qilish muddati:', '2032-10-15'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Yopish', style: TextStyle(color: AppTheme.primary)),
          ),
        ],
      ),
    );
  }

  Widget _buildDialogRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
        Text(value, style: const TextStyle(color: AppTheme.textMain, fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
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
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
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
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppTheme.textMain)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSub)),
        trailing: trailing ?? const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.textMuted),
        onTap: onTap,
      ),
    );
  }
}
