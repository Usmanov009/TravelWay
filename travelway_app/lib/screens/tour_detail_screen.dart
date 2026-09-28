import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/tour_package.dart';
import '../utils/app_theme.dart';
import '../widgets/booking_dialog.dart';
import '../widgets/price_alert_dialog.dart';

class TourDetailScreen extends StatelessWidget {
  final TourPackage tour;

  const TourDetailScreen({super.key, required this.tour});

  Future<void> _openKompasWeb() async {
    if (tour.kompasOnlineUrl.isNotEmpty) {
      final uri = Uri.parse(tour.kompasOnlineUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: CustomScrollView(
        slivers: [
          // Collapsible Image App Bar
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppTheme.bgDark,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.notifications_active_outlined, color: AppTheme.accentGold, size: 20),
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => PriceAlertDialog(tour: tour),
                  );
                },
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    tour.img,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: AppTheme.surfaceDark,
                      child: const Center(child: Icon(Icons.hotel, size: 48, color: AppTheme.textMuted)),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.black38, Colors.transparent, AppTheme.bgDark],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            tour.tag,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.star, color: AppTheme.accentGold, size: 14),
                              const SizedBox(width: 4),
                              Text('${tour.rating}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppTheme.accentGreen.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppTheme.accentGreen),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.bolt, color: AppTheme.accentGreen, size: 14),
                              SizedBox(width: 4),
                              Text('Jonli Narx', style: TextStyle(fontSize: 10, color: AppTheme.accentGreen, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Details Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tour.title,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: AppTheme.primary, size: 16),
                      const SizedBox(width: 4),
                      Text(tour.location, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Key Highlights Row
                  Row(
                    children: [
                      _buildInfoTile(Icons.nights_stay_outlined, 'Davomiyligi', tour.nights),
                      const SizedBox(width: 10),
                      _buildInfoTile(Icons.flight_takeoff, 'Aviaparvoz', tour.airline),
                      const SizedBox(width: 10),
                      _buildInfoTile(Icons.restaurant_outlined, 'Ovqatlanish', tour.mealType),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Flight Information
                  const Text('Parvoz va Tashuvchi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderDark),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.airplanemode_active, color: AppTheme.primary, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(tour.flight, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Text('${tour.departureCity} ➔ ${tour.resort}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.cardDark,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text('To\'g\'ridan-to\'g\'ri', style: TextStyle(fontSize: 10, color: AppTheme.secondary)),
                            ),
                          ],
                        ),
                        if (tour.departureDate.isNotEmpty) ...[
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Uchish sanasi:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                              Text(tour.departureDate, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Tour Package Inclusions
                  const Text('Turpaketga nimalar kiritilgan?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderDark),
                    ),
                    child: Column(
                      children: [
                        _buildInclusionItem('To\'g\'ridan-to\'g\'ri charter aviareys (${tour.airline})'),
                        _buildInclusionItem('Aeroport — Mehmonxona — Aeroport qulay transferi'),
                        _buildInclusionItem('${tour.nightsCount} kecha ${tour.title} mehmonxonasida turar joy'),
                        _buildInclusionItem('${tour.tag} (Ovqatlanish va barcha xizmatlar)'),
                        _buildInclusionItem('Tibbiy sug\'urta (\$30,000 qoplamali)'),
                        _buildInclusionItem('Rasmiy vakil va gid xizmati'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Official Kompas Tour Link
                  if (tour.kompasOnlineUrl.isNotEmpty) ...[
                    GestureDetector(
                      onTap: _openKompasWeb,
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.cardDark,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.primary.withOpacity(0.4)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.link, color: AppTheme.primary, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tour.kompasTourCode.isNotEmpty ? 'Tur kodi: ${tour.kompasTourCode}' : 'Jonli Rasmiy Narx',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const Text('Rasmiy tizimda tekshirish', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                                ],
                              ),
                            ),
                            const Icon(Icons.open_in_new, size: 16, color: AppTheme.primary),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 100),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),

      // Fixed Bottom Booking Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          border: const Border(top: BorderSide(color: AppTheme.borderDark, width: 1)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Umumiy narx (1 kishi):', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                  Row(
                    children: [
                      Text(
                        '\$${tour.price}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary),
                      ),
                      if (tour.oldPrice != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          '\$${tour.oldPrice}',
                          style: const TextStyle(fontSize: 14, color: AppTheme.textMuted, decoration: TextDecoration.lineThrough),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => BookingDialog(tour: tour),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                  backgroundColor: AppTheme.primary,
                ),
                child: const Text('Band qilish', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String title, String subtitle) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderDark),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppTheme.secondary, size: 18),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildInclusionItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_rounded, color: AppTheme.accentGreen, size: 16),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 12))),
        ],
      ),
    );
  }
}
