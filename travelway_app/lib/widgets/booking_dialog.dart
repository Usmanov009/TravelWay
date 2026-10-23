import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/tour_package.dart';
import '../models/booking.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';

class BookingDialog extends StatefulWidget {
  final TourPackage tour;

  const BookingDialog({super.key, required this.tour});

  @override
  State<BookingDialog> createState() => _BookingDialogState();
}

class _BookingDialogState extends State<BookingDialog> {
  final _nameController = TextEditingController(text: 'Sardor Alimov');
  final _phoneController = TextEditingController(text: '+998 90 123 45 67');
  final _passportController = TextEditingController(text: 'AA 1234567');
  String _selectedPayment = 'Humo/Uzcard';
  bool _isSubmitting = false;

  int _adultsCount = 2;
  int _childrenCount = 0;

  int get _perAdult => widget.tour.isLiveKompas ? (widget.tour.price / 2).round() : widget.tour.price;
  int get _perChild => (_perAdult * 0.5).round();
  int get _totalPrice => (_adultsCount * _perAdult) + (_childrenCount * _perChild);
  int get _totalGuests => _adultsCount + _childrenCount;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _passportController.dispose();
    super.dispose();
  }

  Future<void> _submitBooking() async {
    if (_nameController.text.trim().isEmpty || _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, ism va telefon raqamingizni kiriting')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final provider = Provider.of<AppProvider>(context, listen: false);
    final voucherCode = 'VCH-TR-${DateTime.now().millisecondsSinceEpoch % 100000}';
    final bookingId = 'BK-${DateTime.now().millisecondsSinceEpoch % 1000000}';

    final priceStr = _childrenCount > 0
        ? '\$$_totalPrice ($_totalGuests kishi: $_adultsCount katta, $_childrenCount bola)'
        : '\$$_totalPrice ($_totalGuests kishi: $_adultsCount katta)';

    final newBooking = Booking(
      id: bookingId,
      tourTitle: widget.tour.title,
      dest: widget.tour.location,
      dates: widget.tour.departureDate.isNotEmpty ? widget.tour.departureDate : 'Kelgusi hafta',
      status: 'Tasdiqlangan',
      voucherId: voucherCode,
      price: priceStr,
      totalNumeric: _totalPrice,
      travelerName: _nameController.text.trim(),
      type: 'active',
      hotelImg: widget.tour.img,
      flight: widget.tour.flight,
      airline: widget.tour.airline,
      nightsCount: widget.tour.nightsCount,
      passport: _passportController.text.trim(),
      phone: _phoneController.text.trim(),
      guestsCount: _totalGuests,
      adultsCount: _adultsCount,
      childrenCount: _childrenCount,
    );

    await provider.createBooking(newBooking);

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.of(context).pop();

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppTheme.surfaceDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: AppTheme.accentGreen, size: 28),
              SizedBox(width: 10),
              Text('Muvaffaqiyatli bron qilindi!', style: TextStyle(fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Vaucher raqamingiz: $voucherCode', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
              const SizedBox(height: 8),
              Text('Mehmonxona: ${widget.tour.title}'),
              Text('Sayohatchilar: $_totalGuests kishi ($_adultsCount katta, $_childrenCount bola)'),
              Text('Jami narx: \$$_totalPrice (${widget.tour.nights})'),
              const SizedBox(height: 8),
              const Text('Vaucher "Turlarim" bo\'limiga qo\'shildi va tizimda ro\'yxatga olindi.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                provider.setTabIndex(3); // Navigate to Trips screen
              },
              child: const Text('Turlarimga o\'tish'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.surfaceDark,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxWidth: 420),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Turni Bron Qilish', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        widget.tour.img,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 56,
                          height: 56,
                          color: Colors.grey[800],
                          child: const Icon(Icons.hotel),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.tour.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                          Text(widget.tour.location, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text('\$$_totalPrice • ${widget.tour.nights}', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              // Sayohatchilar Tarkibi va Soni
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Sayohatchilar tarkibi va soni', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.accentGreen.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.accentGreen.withOpacity(0.3)),
                    ),
                    child: Text('Jami: $_totalGuests kishi', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentGreen)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Katta odamlar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('🧑 Katta odamlar', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('12 yoshdan yuqori', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.cardDark,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.borderDark),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => setState(() => _adultsCount = (_adultsCount - 1).clamp(1, 10)),
                            borderRadius: const BorderRadius.horizontal(left: Radius.circular(10)),
                            child: Container(
                              width: 32,
                              height: 32,
                              alignment: Alignment.center,
                              child: const Text('-', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                            ),
                          ),
                          Container(
                            constraints: const BoxConstraints(minWidth: 32),
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            alignment: Alignment.center,
                            child: Text(
                              '$_adultsCount',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primary),
                            ),
                          ),
                          InkWell(
                            onTap: () => setState(() => _adultsCount = (_adultsCount + 1).clamp(1, 10)),
                            borderRadius: const BorderRadius.horizontal(right: Radius.circular(10)),
                            child: Container(
                              width: 32,
                              height: 32,
                              alignment: Alignment.center,
                              child: const Text('+', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 8),

              // Yosh bolalar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('👶 Yosh bolalar', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('0-11 yosh (50% chegirma)', style: TextStyle(fontSize: 10, color: AppTheme.accentGreen)),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.cardDark,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.borderDark),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => setState(() => _childrenCount = (_childrenCount - 1).clamp(0, 6)),
                            borderRadius: const BorderRadius.horizontal(left: Radius.circular(10)),
                            child: Container(
                              width: 32,
                              height: 32,
                              alignment: Alignment.center,
                              child: const Text('-', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                            ),
                          ),
                          Container(
                            constraints: const BoxConstraints(minWidth: 32),
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            alignment: Alignment.center,
                            child: Text(
                              '$_childrenCount',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.accentGreen),
                            ),
                          ),
                          InkWell(
                            onTap: () => setState(() => _childrenCount = (_childrenCount + 1).clamp(0, 6)),
                            borderRadius: const BorderRadius.horizontal(right: Radius.circular(10)),
                            child: Container(
                              width: 32,
                              height: 32,
                              alignment: Alignment.center,
                              child: const Text('+', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.accentGreen)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              const Text('Asosiy sayohatchi ma\'lumotlari', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 8),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Ism va Familiya',
                  prefixIcon: Icon(Icons.person_outline, size: 18),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Telefon raqam',
                  prefixIcon: Icon(Icons.phone_outlined, size: 18),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _passportController,
                decoration: const InputDecoration(
                  labelText: 'Pasport seriya va raqam',
                  prefixIcon: Icon(Icons.badge_outlined, size: 18),
                ),
              ),

              const SizedBox(height: 14),
              // Narx smetasi hisob-kitobi
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
                        Expanded(
                          child: Text('Katta odamlar ($_adultsCount kishi):', style: const TextStyle(fontSize: 11, color: AppTheme.textSub)),
                        ),
                        Text('\$${_adultsCount * _perAdult}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    if (_childrenCount > 0) ...[
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text('Yosh bolalar ($_childrenCount bola - 50%):', style: const TextStyle(fontSize: 11, color: AppTheme.accentGreen)),
                          ),
                          Text('\$${_childrenCount * _perChild}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentGreen)),
                        ],
                      ),
                    ],
                    const Divider(color: AppTheme.borderDark, height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Jami to\'lov summasi:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('\$$_totalPrice', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),
              const Text('To\'lov usuli', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                children: ['Humo/Uzcard', 'Payme', 'Click', 'Visa'].map((m) {
                  final isSel = _selectedPayment == m;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedPayment = m),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSel ? AppTheme.primary.withOpacity(0.15) : AppTheme.cardDark,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isSel ? AppTheme.primary : AppTheme.borderDark),
                        ),
                        child: Center(
                          child: Text(
                            m,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                              color: isSel ? AppTheme.primary : Colors.white70,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitBooking,
                  icon: const Icon(Icons.calendar_month, size: 18),
                  label: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('Turni Bron Qilish (\$$_totalPrice)'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
