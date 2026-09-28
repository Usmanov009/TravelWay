import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: const Text('Boshqaruv Paneli (Admin)'),
        backgroundColor: AppTheme.surfaceDark,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Row
            Row(
              children: [
                _buildStatCard('Buyurtmalar', '${provider.bookings.length}', Icons.shopping_bag_outlined, AppTheme.primary),
                const SizedBox(width: 10),
                _buildStatCard('Narx Signallari', '${provider.alerts.length}', Icons.notifications_active_outlined, AppTheme.accentGold),
                const SizedBox(width: 10),
                _buildStatCard('Jonli Tizim', provider.isKompasOnline ? 'Faol' : 'Kutilmoqda', Icons.wifi, AppTheme.accentGreen),
              ],
            ),
            const SizedBox(height: 20),

            // Server & DB Status Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderDark),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tizim va Server Holati', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Backend API:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      Text(
                        provider.isBackendOnline ? 'Faol (${provider.apiService.baseUrl})' : 'Ulanmagan',
                        style: TextStyle(
                          color: provider.isBackendOnline ? AppTheme.accentGreen : Colors.redAccent,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Jonli Tizim Serveri:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      Text(
                        provider.isKompasOnline ? 'Jonli tizim faol (200 OK)' : 'Aloqa yo\'q',
                        style: TextStyle(
                          color: provider.isKompasOnline ? AppTheme.accentGreen : Colors.orange,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Recent Bookings in Admin
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Mijozlar Buyurtmalari', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                TextButton(
                  onPressed: () => provider.loadBookings(),
                  child: const Text('Yangilash'),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (provider.bookings.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: AppTheme.surfaceDark, borderRadius: BorderRadius.circular(16)),
                child: const Center(child: Text('Buyurtmalar mavjud emas', style: TextStyle(color: AppTheme.textMuted))),
              )
            else
              ...provider.bookings.map((b) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.person, color: AppTheme.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(b.travelerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('${b.tourTitle} • ${b.price}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                          Text('Tel: ${b.phone.isNotEmpty ? b.phone : '+998 90 123 45 67'}', style: const TextStyle(color: AppTheme.secondary, fontSize: 11)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: AppTheme.accentGreen.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                      child: Text(b.status, style: const TextStyle(color: AppTheme.accentGreen, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String val, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderDark),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 8),
            Text(val, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 2),
            Text(title, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
          ],
        ),
      ),
    );
  }
}
