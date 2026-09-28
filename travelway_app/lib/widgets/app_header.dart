import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

class AppHeader extends StatelessWidget {
  final int currentTabIndex;
  final VoidCallback? onAvatarClick;

  const AppHeader({
    super.key,
    required this.currentTabIndex,
    this.onAvatarClick,
  });

  Map<String, String> _getTitles(int index) {
    switch (index) {
      case 0:
        return {
          'title': 'TravelWay',
          'sub': 'Turpaketlar qidiruvi & Charter reyslar',
        };
      case 1:
        return {
          'title': 'Kashf etish',
          'sub': "Sayohat g'oyalari va yo'nalishlar",
        };
      case 2:
        return {
          'title': 'Qaynoq Takliflar',
          'sub': '50% gacha tejash • Cheklangan vaqt',
        };
      case 3:
        return {
          'title': 'Mening Turlarim',
          'sub': 'Buyurtmalar, vaucherlar va hisob',
        };
      case 4:
        return {
          'title': 'Mening Profilim',
          'sub': 'Sozlamalar va shaxsiy kabinet',
        };
      default:
        return {
          'title': 'TravelWay',
          'sub': 'Arzon turlar & Charter reyslar',
        };
    }
  }

  void _showQrDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.accentLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.qr_code_scanner, color: AppTheme.primary, size: 28),
              ),
              const SizedBox(height: 14),
              const Text(
                'Pasport & Vaucher QR Skaneri',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textMain),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Tezkor ro\'yxatdan o\'tish yoki vaucher ma\'lumotlarini tasdiqlash uchun kamerani kodingizga qarating.',
                style: TextStyle(fontSize: 12, color: AppTheme.textSub),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: const Center(
                  child: Icon(Icons.qr_code_2, size: 100, color: AppTheme.primary),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Yopish'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final titles = _getTitles(currentTabIndex);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppTheme.surfaceDark,
        border: Border(
          bottom: BorderSide(color: AppTheme.borderDark, width: 1),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // TW Logo
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(1.5),
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Text(
                    'TW',
                    style: TextStyle(
                      color: AppTheme.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),

            // Title & Subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Text(
                        titles['title']!,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textMain,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: AppTheme.accentLight,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.primary.withOpacity(0.3), width: 0.8),
                        ),
                        child: const Text(
                          'TRAVEL',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontSize: 8,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 1),
                  Text(
                    titles['sub']!,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSub,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Action Tools
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // QR Scanner
                GestureDetector(
                  onTap: () => _showQrDialog(context),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppTheme.subtleDark,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.borderDark),
                    ),
                    child: const Icon(Icons.qr_code_scanner, size: 16, color: AppTheme.textSub),
                  ),
                ),
                const SizedBox(width: 6),

                // Notifications Bell with Red Dot
                GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Yangi bildirishnoma: Maldiv va Dubay turlariga 30% chegirmalar!'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppTheme.subtleDark,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.borderDark),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        const Icon(Icons.notifications_none, size: 17, color: AppTheme.textSub),
                        Positioned(
                          top: 6,
                          right: 6,
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: AppTheme.accentRed,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // User Avatar AY
                GestureDetector(
                  onTap: onAvatarClick,
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.primary, AppTheme.accentSky],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(1.5),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceDark,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: Text(
                          'AY',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
