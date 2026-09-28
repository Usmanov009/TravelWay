import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';
import 'admin_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _notifications = true;

  Future<void> _openTelegram() async {
    final uri = Uri.parse('https://t.me/mytravelwaybot');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showBackendDialog(BuildContext context, AppProvider provider) {
    final controller = TextEditingController(text: provider.apiService.baseUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.dns_outlined, color: AppTheme.primary, size: 22),
            SizedBox(width: 8),
            Text('Server Manzili', style: TextStyle(fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Agar emulatorda bo\'lsangiz: http://10.0.2.2:3000\nAgar Wi-Fi orqali real telefon bo\'lsa: kompyuteringiz IP manzili',
              style: TextStyle(fontSize: 11, color: AppTheme.textSub),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(labelText: 'Backend URL'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () {
              provider.updateBackendUrl(controller.text.trim());
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Server manzili yangilandi!')),
              );
            },
            child: const Text('Saqlash'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. User Info Card (Exact Web Match)
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
                  // Avatar AY
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
                          child: const Center(
                            child: Text(
                              'AY',
                              style: TextStyle(
                                color: AppTheme.primary,
                                fontSize: 20,
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
                            const Text(
                              'Alisher Yusupov',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textMain,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.verified, size: 16, color: AppTheme.primary),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          '+998 90 123 45 67',
                          style: TextStyle(fontSize: 12, color: AppTheme.textSub),
                        ),
                        const SizedBox(height: 2),
                        const Row(
                          children: [
                            Text(
                              'ID: #TC-882109',
                              style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: AppTheme.textMuted),
                            ),
                            SizedBox(width: 8),
                            Text(
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

            // 2. Loyalty / Cashback Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2C2416), Color(0xFF1E1A14)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Text('👑', style: TextStyle(fontSize: 16)),
                          SizedBox(width: 6),
                          Text(
                            'Silver Sayohatchi',
                            style: TextStyle(
                              color: Colors.amber,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          '3% Cashback',
                          style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Hisobdagi ballar:', style: TextStyle(fontSize: 11, color: Colors.white70)),
                      Text(
                        '1,250,000 UZS',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: const LinearProgressIndicator(
                      value: 0.62,
                      backgroundColor: Colors.white24,
                      color: Colors.amber,
                      minHeight: 5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Gold darajagacha 750,000 UZS qoldi',
                    style: TextStyle(fontSize: 10, color: Colors.white60),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 3. Quick Stats Row
            Row(
              children: [
                _buildStatTile('${provider.bookings.length} ta', 'Faol turlar', Icons.luggage_outlined),
                const SizedBox(width: 10),
                _buildStatTile('${provider.alerts.length} ta', 'Narx signallari', Icons.notifications_active_outlined),
                const SizedBox(width: 10),
                _buildStatTile('12,500', 'Sayohat millari', Icons.flight_takeoff_outlined),
              ],
            ),
            const SizedBox(height: 16),

            // 4. Settings Sections
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
                    subtitle: 'Ism, telefon, e-mail',
                    onTap: () {},
                  ),
                  const Divider(height: 1, indent: 56),
                  _buildSettingItem(
                    icon: Icons.badge_outlined,
                    title: 'Pasport ma\'lumotlari',
                    subtitle: 'AA 1234567 • O\'zbekiston',
                    onTap: () {},
                  ),
                  const Divider(height: 1, indent: 56),
                  _buildSettingItem(
                    icon: Icons.credit_card_outlined,
                    title: 'To\'lov kartalari',
                    subtitle: 'Uzcard, Humo, Visa',
                    onTap: () {},
                  ),
                  const Divider(height: 1, indent: 56),
                  _buildSettingItem(
                    icon: Icons.dns_outlined,
                    title: 'Server manzili (Backend URL)',
                    subtitle: provider.apiService.baseUrl,
                    trailing: const Icon(Icons.edit, size: 16, color: AppTheme.primary),
                    onTap: () => _showBackendDialog(context, provider),
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
                  // Live Engine Status Tile
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: provider.isKompasOnline ? AppTheme.accentGreen.withOpacity(0.15) : Colors.orange.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            Icons.radar,
                            color: provider.isKompasOnline ? AppTheme.accentGreen : Colors.orange,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Jonli Turlar Tizimi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                              Text('Jonli 1:1 Rasmiy Narxlar', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: provider.isKompasOnline ? AppTheme.accentGreen.withOpacity(0.15) : Colors.orange.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            provider.isKompasOnline ? 'Faol' : 'Kutilmoqda',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: provider.isKompasOnline ? AppTheme.accentGreen : Colors.orange,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, indent: 56),

                  // Notifications Toggle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.subtleDark,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.notifications_none, size: 20, color: AppTheme.textSub),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Bildirishnomalar', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                              Text('Qaynoq turlar va chegirmalar haqida xabar', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                            ],
                          ),
                        ),
                        Switch(
                          value: _notifications,
                          activeColor: AppTheme.primary,
                          onChanged: (val) => setState(() => _notifications = val),
                        ),
                      ],
                    ),
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
                    subtitle: '@mytravelwaybot',
                    onTap: _openTelegram,
                  ),
                  const Divider(height: 1, indent: 56),

                  _buildSettingItem(
                    icon: Icons.admin_panel_settings_outlined,
                    title: 'Boshqaruv Paneli (Admin)',
                    subtitle: 'Turlar, buyurtmalar va statistika',
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.textMuted),
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminScreen()));
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // App Version Footer
            const Center(
              child: Column(
                children: [
                  Text('TravelWay Mobile v1.0.0', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                  SizedBox(height: 2),
                  Text('Powered by TravelWay Live Engine', style: TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                ],
              ),
            ),
          ],
        ),
      ),
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
    return ListTile(
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
    );
  }
}
