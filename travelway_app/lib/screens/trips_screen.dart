import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/app_provider.dart';
import '../models/booking.dart';
import '../models/tour_package.dart';
import '../utils/app_theme.dart';
import 'tour_detail_screen.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  // 'active', 'cancelled', 'saved'
  String _subTab = 'active';

  void _showVoucherDetails(BuildContext context, Booking booking) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: AppTheme.surfaceDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Container(
          padding: const EdgeInsets.all(20),
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Sayohatchi Vaucheri', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textMain)),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18, color: AppTheme.textSub),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const Divider(color: AppTheme.borderDark),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Vaucher ID:', style: TextStyle(color: AppTheme.textSub, fontSize: 12)),
                        Text(booking.voucherId, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Sayohatchi:', style: TextStyle(color: AppTheme.textSub, fontSize: 12)),
                        Text(booking.travelerName, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Sayohatchilar:', style: TextStyle(color: AppTheme.textSub, fontSize: 12)),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            '${booking.guestsCount} kishi (${booking.adultsCount} katta${booking.childrenCount > 0 ? ', ${booking.childrenCount} bola' : ''})',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMain, fontSize: 11),
                            textAlign: TextAlign.end,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Holati:', style: TextStyle(color: AppTheme.textSub, fontSize: 12)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppTheme.accentGreen.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                          child: Text(booking.status, style: const TextStyle(color: AppTheme.accentGreen, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text(booking.tourTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain)),
              const SizedBox(height: 4),
              Text(booking.dest, style: const TextStyle(color: AppTheme.textSub, fontSize: 12)),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_month, size: 14, color: AppTheme.accentSky),
                  const SizedBox(width: 6),
                  Text(booking.dates, style: const TextStyle(fontSize: 12, color: AppTheme.textSub)),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.airplanemode_active, size: 14, color: AppTheme.primary),
                  const SizedBox(width: 6),
                  Text(booking.flight, style: const TextStyle(fontSize: 12, color: AppTheme.textSub)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Jami to\'lov:', style: TextStyle(color: AppTheme.textSub)),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      booking.price,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primary),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(44),
                ),
                child: const Text('Yopish'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmCancelBooking(BuildContext context, AppProvider provider, Booking booking) {
    String selectedReason = "Rejalarim o'zgardi";

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            backgroundColor: AppTheme.surfaceDark,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: const Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 28),
                SizedBox(width: 10),
                Text('Turni bekor qilish', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${booking.tourTitle} (${booking.voucherId}) turini bekor qilishni xohlaysizmi?',
                    style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.subtleDark,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderDark),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('To\'langan summa:', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                booking.price,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                                textAlign: TextAlign.end,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Qaytariladigan summa:', style: TextStyle(fontSize: 11, color: AppTheme.accentGreen)),
                            Text('100% Qaytariladi ✓', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentGreen)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('Bekor qilish sababi:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSub)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      "Rejalarim o'zgardi",
                      "Boshqa sanaga",
                      "Boshqa turpaket",
                      "Shaxsiy sabab"
                    ].map((reason) {
                      final isSelected = selectedReason == reason;
                      return ChoiceChip(
                        label: Text(reason, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : AppTheme.textSub)),
                        selected: isSelected,
                        selectedColor: AppTheme.primary,
                        backgroundColor: AppTheme.cardDark,
                        onSelected: (val) {
                          if (val) setDialogState(() => selectedReason = reason);
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Qaytish'),
              ),
              ElevatedButton(
                onPressed: () async {
                  final messenger = ScaffoldMessenger.of(context);
                  Navigator.pop(ctx);
                  await provider.cancelBooking(booking.id, reason: selectedReason);
                  if (mounted) {
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text('"${booking.tourTitle}" turi bekor qilindi. Mablag\' to\'liq qaytarildi.'),
                        backgroundColor: Colors.red[700],
                      ),
                    );
                    setState(() => _subTab = 'cancelled');
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
                child: const Text('Ha, bekor qilinsin', style: TextStyle(color: Colors.white)),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _shareTelegram(Booking b) async {
    final text = Uri.encodeComponent(
      'SayrHub Vaucher:\n'
      'Mehmonxona: ${b.tourTitle}\n'
      'Manzil: ${b.dest}\n'
      'Sayyohlar: ${b.guestsCount} kishi (${b.adultsCount} katta, ${b.childrenCount} bola)\n'
      'Vaucher ID: ${b.voucherId}\n'
      'Narx: ${b.price}\n'
      'Holat: ${b.status}'
    );
    final url = Uri.parse('https://t.me/share/url?url=https://sayrhub.uz&text=$text');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    final activeBookings = provider.bookings.where((b) => b.type == 'active' && b.status != 'Bekor qilingan').toList();
    final cancelledBookings = provider.bookings.where((b) => b.type == 'cancelled' || b.status == 'Bekor qilingan').toList();
    final savedTours = provider.tours.where((t) => provider.isFavorite(t.id)).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Trips Subheader Toggle Tabs (Faol, Bekor qilingan, Saqlangan)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderDark),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _subTab = 'active'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _subTab == 'active' ? AppTheme.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            '📋 Faol (${activeBookings.length})',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _subTab == 'active' ? Colors.white : AppTheme.textSub,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _subTab = 'cancelled'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _subTab == 'cancelled' ? AppTheme.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            '🚫 Bekor (${cancelledBookings.length})',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _subTab == 'cancelled' ? Colors.white : AppTheme.textSub,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _subTab = 'saved'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _subTab == 'saved' ? AppTheme.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            '❤️ Saqlangan (${savedTours.length})',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _subTab == 'saved' ? Colors.white : AppTheme.textSub,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Tab Content
            if (_subTab == 'active')
              _buildActiveBookingsList(context, provider, activeBookings)
            else if (_subTab == 'cancelled')
              _buildCancelledBookingsList(context, provider, cancelledBookings)
            else
              _buildSavedList(context, provider, savedTours),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveBookingsList(BuildContext context, AppProvider provider, List<Booking> bookings) {
    if (provider.isLoadingBookings) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }

    if (bookings.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.borderDark),
        ),
        alignment: Alignment.center,
        child: Column(
          children: [
            const Text('🧳', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            const Text(
              'Sizda hozircha faol buyurtmalar yo\'q',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
            ),
            const SizedBox(height: 6),
            const Text(
              'SayrHub orqali o\'zingizga yoqqan turni bir zumda band qiling.',
              style: TextStyle(fontSize: 11, color: AppTheme.textSub),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => provider.setTabIndex(0),
              child: const Text('Turpaketlarni qidirish'),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: bookings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, idx) {
        final b = bookings[idx];

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderDark),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header ID & Status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'ID: ${b.voucherId}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textSub,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.accentGreen.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.accentGreen.withOpacity(0.3)),
                    ),
                    child: Text(
                      '✓ ${b.status}',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.accentGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Title
              Text(
                b.tourTitle,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
              const SizedBox(height: 8),

              // Info Grid
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppTheme.primary),
                        const SizedBox(width: 6),
                        Expanded(child: Text(b.dest, style: const TextStyle(fontSize: 11, color: AppTheme.textMain))),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.calendar_month, size: 14, color: AppTheme.accentSky),
                        const SizedBox(width: 6),
                        Expanded(child: Text(b.dates, style: const TextStyle(fontSize: 11, color: AppTheme.textSub))),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.people_outline, size: 14, color: AppTheme.primary),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Sayohatchilar: ${b.guestsCount} kishi (${b.adultsCount} katta${b.childrenCount > 0 ? ', ${b.childrenCount} bola' : ''})',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textMain),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.person, size: 14, color: AppTheme.textMuted),
                        const SizedBox(width: 6),
                        Expanded(child: Text('Sayyoh: ${b.travelerName}', style: const TextStyle(fontSize: 11, color: AppTheme.textSub))),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Total Price
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Jami to\'lov:', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      b.price,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.primary),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showVoucherDetails(context, b),
                      icon: const Icon(Icons.receipt_long, size: 14),
                      label: const Text('Vaucher', style: TextStyle(fontSize: 11)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _confirmCancelBooking(context, provider, b),
                      icon: const Icon(Icons.cancel_outlined, size: 14, color: Colors.redAccent),
                      label: const Text('Bekor qilish', style: TextStyle(fontSize: 11, color: Colors.redAccent, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        side: BorderSide(color: Colors.red.withOpacity(0.5)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton(
                    onPressed: () => _shareTelegram(b),
                    icon: const Icon(Icons.send, size: 18, color: Color(0xFF24A1DE)),
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.subtleDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCancelledBookingsList(BuildContext context, AppProvider provider, List<Booking> cancelledBookings) {
    if (cancelledBookings.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.borderDark),
        ),
        alignment: Alignment.center,
        child: const Column(
          children: [
            Text('✅', style: TextStyle(fontSize: 48)),
            SizedBox(height: 12),
            Text(
              'Bekor qilingan buyurtmalar mavjud emas',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
            ),
            SizedBox(height: 6),
            Text(
              'Barcha faol bronlaringiz "Faol" bo\'limida saqlanadi.',
              style: TextStyle(fontSize: 11, color: AppTheme.textSub),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: cancelledBookings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, idx) {
        final b = cancelledBookings[idx];

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.red.withOpacity(0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ID: ${b.voucherId}', style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: AppTheme.textSub)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.withOpacity(0.4)),
                    ),
                    child: const Text(
                      '✕ Bekor qilingan',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.redAccent),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // 100% Refund banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.accentGreen.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.accentGreen.withOpacity(0.25)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('💸 Mablag\' to\'liq qaytarilgan (100%)', style: TextStyle(fontSize: 10, color: AppTheme.accentGreen)),
                    Text('Qaytarildi ✓', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentGreen)),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              Text(
                b.tourTitle,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textSub, decoration: TextDecoration.lineThrough),
              ),
              const SizedBox(height: 6),

              Text('📍 ${b.dest} • 📅 ${b.dates}', style: const TextStyle(fontSize: 11, color: AppTheme.textSub)),
              const SizedBox(height: 4),
              Text(
                '👥 Sayohatchilar: ${b.guestsCount} kishi (${b.adultsCount} katta${b.childrenCount > 0 ? ', ${b.childrenCount} bola' : ''})',
                style: const TextStyle(fontSize: 11, color: AppTheme.textMain),
              ),
              if (b.cancellationReason.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text('Sababi: ${b.cancellationReason}', style: const TextStyle(fontSize: 10, color: Colors.redAccent)),
              ],
              const SizedBox(height: 12),

              // Price and Cancelled notice
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Bekor qilingan summa:', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      b.price,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textSub,
                        decoration: TextDecoration.lineThrough,
                      ),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => provider.setTabIndex(0),
                      icon: const Icon(Icons.refresh, size: 14),
                      label: const Text('Qayta bron qilish', style: TextStyle(fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () => provider.removeBooking(b.id),
                    icon: const Icon(Icons.delete_outline, size: 14, color: Colors.redAccent),
                    label: const Text('O\'chirish', style: TextStyle(fontSize: 11, color: Colors.redAccent)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      side: BorderSide(color: Colors.red.withOpacity(0.4)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSavedList(BuildContext context, AppProvider provider, List<TourPackage> savedTours) {
    if (savedTours.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.borderDark),
        ),
        alignment: Alignment.center,
        child: Column(
          children: [
            const Text('❤️', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            const Text(
              'Saqlangan turlar yo\'q',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
            ),
            const SizedBox(height: 6),
            const Text(
              'Yoqtirgan turlaringizni keyinroq ko\'rish uchun yurakcha belgisini bosing.',
              style: TextStyle(fontSize: 11, color: AppTheme.textSub),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => provider.setTabIndex(0),
              child: const Text('Qidiruvga o\'tish'),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: savedTours.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, idx) {
        final tour = savedTours[idx];

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  tour.img,
                  width: 70,
                  height: 70,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(width: 70, height: 70, color: AppTheme.subtleDark),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tour.title,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tour.location,
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '\$${tour.price}',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppTheme.primary),
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  IconButton(
                    icon: const Icon(Icons.favorite, color: Colors.red, size: 20),
                    onPressed: () => provider.toggleFavorite(tour.id),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => TourDetailScreen(tour: tour)),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.subtleDark,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('Ko\'rish', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
