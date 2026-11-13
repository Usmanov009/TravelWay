import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/tour_package.dart';
import '../models/booking.dart';
import '../models/payment_card.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';
import '../utils/flaticon_icons.dart';

class TourBookingScreen extends StatefulWidget {
  final TourPackage tour;
  final int initialAdults;
  final int initialChildren;

  const TourBookingScreen({
    super.key,
    required this.tour,
    this.initialAdults = 2,
    this.initialChildren = 0,
  });

  @override
  State<TourBookingScreen> createState() => _TourBookingScreenState();
}

class _TourBookingScreenState extends State<TourBookingScreen> {
  static final RegExp _nameCharRegExp =
      RegExp(r"[a-zA-Z\u00C0-\u024F\u2019'`?'\- ]");

  static String _normalizePassport(String input) {
    final cleaned = input.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    if (cleaned.length < 2) return cleaned;
    final letters = cleaned.substring(0, 2).replaceAll(RegExp(r'[^A-Z]'), '');
    final digits = cleaned.substring(2).replaceAll(RegExp(r'[^0-9]'), '');
    final combined = '$letters$digits';
    if (combined.length <= 2) return combined;
    return '${combined.substring(0, 2)} ${combined.substring(2, combined.length > 9 ? 9 : combined.length)}';
  }
  // Stepper state
  late int _adultsCount;
  late int _childrenCount;

  // Form controllers for Lead Traveler
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController(text: '+998 ');
  final _passportController = TextEditingController();
  final _dobController = TextEditingController();

  // Dynamic controllers for Additional Travelers
  final List<TextEditingController> _extraNameControllers = [];
  final List<TextEditingController> _extraPassportControllers = [];

  // Payment state
  String _selectedPayment = 'Payme';
  List<PaymentCard> _savedCards = [];
  String? _selectedCardId;

  bool _isLoadingSavedData = true;
  bool _isSubmitting = false;
  Booking? _completedBooking;

  int get _perAdult => widget.tour.isLiveKompas
      ? (widget.tour.price / 2).round()
      : widget.tour.price;
  int get _perChild => (_perAdult * 0.5).round();
  int get _totalPrice =>
      (_adultsCount * _perAdult) + (_childrenCount * _perChild);
  int get _totalGuests => _adultsCount + _childrenCount;

  @override
  void initState() {
    super.initState();
    _adultsCount = widget.initialAdults.clamp(1, 10);
    _childrenCount = widget.initialChildren.clamp(0, 6);
    _syncExtraTravelersControllers();
    _loadUserProfile();
  }

  void _syncExtraTravelersControllers() {
    final extraCount = _totalGuests > 1 ? _totalGuests - 1 : 0;
    while (_extraNameControllers.length < extraCount) {
      _extraNameControllers.add(TextEditingController());
      _extraPassportControllers.add(TextEditingController());
    }
    while (_extraNameControllers.length > extraCount) {
      _extraNameControllers.removeLast().dispose();
      _extraPassportControllers.removeLast().dispose();
    }
  }

  Future<void> _loadUserProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedName = prefs.getString('sayrhub_user_name');
      final savedPhone = prefs.getString('sayrhub_user_phone');
      final savedPassport = prefs.getString('sayrhub_user_passport');

      if (savedName != null && savedName.isNotEmpty) {
        _nameController.text = savedName;
      }
      if (savedPhone != null && savedPhone.isNotEmpty) {
        _phoneController.text = savedPhone;
      }
      if (savedPassport != null && savedPassport.isNotEmpty) {
        _passportController.text = savedPassport;
      }

      // Load saved payment cards
      final cardsRaw = prefs.getString('sayrhub_user_payment_cards');
      if (cardsRaw != null && cardsRaw.isNotEmpty) {
        final cards = PaymentCard.decodeList(cardsRaw);
        _savedCards = cards;
        final primary = cards.where((c) => c.isPrimary).firstOrNull;
        if (primary != null) {
          _selectedCardId = primary.id;
        } else if (cards.isNotEmpty) {
          _selectedCardId = cards.first.id;
        }
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoadingSavedData = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _passportController.dispose();
    _dobController.dispose();
    for (final c in _extraNameControllers) {
      c.dispose();
    }
    for (final c in _extraPassportControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _updateAdults(int delta) {
    setState(() {
      _adultsCount = (_adultsCount + delta).clamp(1, 10);
      _syncExtraTravelersControllers();
    });
  }

  void _updateChildren(int delta) {
    setState(() {
      _childrenCount = (_childrenCount + delta).clamp(0, 6);
      _syncExtraTravelersControllers();
    });
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 25, 1, 1),
      firstDate: DateTime(1930),
      lastDate: now,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              surface: AppTheme.surfaceDark,
              onSurface: AppTheme.textMain,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _dobController.text =
            '${picked.day.toString().padLeft(2, '0')}.${picked.month.toString().padLeft(2, '0')}.${picked.year}';
      });
    }
  }

  Future<void> _submitBooking() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final passport = _normalizePassport(_passportController.text);

    if (name.isEmpty || name.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Iltimos, ism va familiyangizni to\'liq kiriting'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
      return;
    }
    if (!RegExp(r"^[a-zA-Z\u00C0-\u024F\u2019'`?'\- ]+$").hasMatch(name)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ism va familiyada faqat harflar bo\'lishi kerak'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
      return;
    }

    final phoneDigits = phone.replaceAll(RegExp(r'\D'), '');
    if (phoneDigits.length < 9) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Iltimos, to\'g\'ri telefon raqamingizni kiriting'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
      return;
    }

    final passportClean = passport.replaceAll(' ', '');
    if (!RegExp(r'^[A-Z]{2}\d{7}$').hasMatch(passportClean)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Pasport formati: 2 ta harf va 7 ta raqam (masalan: AA 1234567)',
          ),
          backgroundColor: AppTheme.accentRed,
        ),
      );
      return;
    }
    _passportController.text = passport;

    setState(() => _isSubmitting = true);

    final provider = Provider.of<AppProvider>(context, listen: false);
    final voucherCode =
        'VCH-TR-${DateTime.now().millisecondsSinceEpoch % 100000}';
    final bookingId = 'BK-${DateTime.now().millisecondsSinceEpoch % 1000000}';

    final priceStr = _childrenCount > 0
        ? '\$$_totalPrice ($_totalGuests kishi: $_adultsCount katta, $_childrenCount bola)'
        : '\$$_totalPrice ($_totalGuests kishi: $_adultsCount katta)';

    String travelerId = '';
    try {
      final prefs = await SharedPreferences.getInstance();
      travelerId = prefs.getString('sayrhub_user_id') ?? '';
      await prefs.setString('sayrhub_user_name', name);
      await prefs.setString('sayrhub_user_phone', phone);
      await prefs.setString('sayrhub_user_passport', passport);
    } catch (_) {}

    final newBooking = Booking(
      id: bookingId,
      tourTitle: widget.tour.title,
      dest: widget.tour.location,
      dates: widget.tour.departureDate.isNotEmpty
          ? widget.tour.departureDate
          : 'Kelgusi hafta',
      status: 'Tasdiqlangan',
      voucherId: voucherCode,
      price: priceStr,
      totalNumeric: _totalPrice,
      travelerName: name,
      travelerId: travelerId,
      type: 'active',
      hotelImg: widget.tour.img,
      flight: widget.tour.flight,
      airline: widget.tour.airline,
      nightsCount: widget.tour.nightsCount,
      passport: passport,
      phone: phone,
      guestsCount: _totalGuests,
      adultsCount: _adultsCount,
      childrenCount: _childrenCount,
    );

    await provider.createBooking(newBooking);

    // Add to favorites and cart for persistence across app restarts
    await provider.toggleFavorite(widget.tour.id);
    await provider.addToCart(widget.tour.id, quantity: _totalGuests);

    if (mounted) {
      setState(() {
        _isSubmitting = false;
        _completedBooking = newBooking;
      });
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label nusxalandi: $text'),
        backgroundColor: AppTheme.accentGreen,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _shareOnTelegram(Booking b) async {
    final text = Uri.encodeComponent(
      '🌟 SayrHub Vaucheri:\n'
      '🏨 Mehmonxona: ${b.tourTitle}\n'
      '📍 Manzil: ${b.dest}\n'
      '👤 Sayohatchi: ${b.travelerName}\n'
      '👥 Sayyohlar: ${b.guestsCount} kishi (${b.adultsCount} katta${b.childrenCount > 0 ? ', ${b.childrenCount} bola' : ''})\n'
      '🎟️ Vaucher ID: ${b.voucherId}\n'
      '💰 Summa: ${b.price}\n'
      '✈️ Parvoz: ${b.flight}\n'
      '✅ Holati: ${b.status}\n\n'
      'Barcha tafsilotlar SayrHub ilovasida saqlandi.',
    );
    final url = Uri.parse(
      'https://t.me/share/url?url=https://sayrhub.uz&text=$text',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_completedBooking != null) {
      return PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, _) {
          if (didPop) return;
          final provider = Provider.of<AppProvider>(context, listen: false);
          provider.setTabIndex(3);
          Navigator.of(context).popUntil((route) => route.isFirst);
        },
        child: _buildSuccessScreen(_completedBooking!),
      );
    }

    final formattedUzs = (_totalPrice * 12850).toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]} ',
    );

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: const Text('Turni bron qilish'),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(FlaticonIcons.arrowBack, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 14),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.accentGreen.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.accentGreen.withOpacity(0.3)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  FlaticonIcons.verified,
                  size: 14,
                  color: AppTheme.accentGreen,
                ),
                SizedBox(width: 4),
                Text(
                  'Kafolatlangan',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.accentGreen,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: _isLoadingSavedData
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Tour Summary Hero Card
                  _buildTourSummaryCard(),
                  const SizedBox(height: 18),

                  // 2. Sayohatchilar Tarkibi va Soni
                  _buildTravelersCountSection(),
                  const SizedBox(height: 18),

                  // 3. Asosiy Sayohatchi Ma'lumotlari
                  _buildLeadTravelerSection(),
                  const SizedBox(height: 18),

                  // 4. Qo'shimcha Sayohatchilar (agar > 1 kishi bo'lsa)
                  if (_totalGuests > 1) ...[
                    _buildExtraTravelersSection(),
                    const SizedBox(height: 18),
                  ],

                  // 5. Turpaketga Kiritilgan Xizmatlar
                  _buildInclusionsSection(),
                  const SizedBox(height: 18),

                  // 6. To'lov Usullari
                  _buildPaymentMethodsSection(),
                  const SizedBox(height: 18),

                  // 7. Narx Taqsimoti va Smeta
                  _buildPriceBreakdownSection(formattedUzs),
                  const SizedBox(height: 14),

                  // Security note
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderDark),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          FlaticonIcons.shieldOutlined,
                          size: 20,
                          color: AppTheme.accentGreen,
                        ),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'SayrHub va Kompas Tour rasmiy kafolati ostida. Vaucher bir zumda tizimda ro\'yxatdan o\'tadi.',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.textSub,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
      // Sticky Bottom Booking Bar
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          border: const Border(
            top: BorderSide(color: AppTheme.borderDark, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Jami to\'lov summasi:',
                      style: TextStyle(fontSize: 11, color: AppTheme.textSub),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '\$$_totalPrice',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            '~ $formattedUzs so\'m',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textMuted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitBooking,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 22,
                    vertical: 14,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.2,
                        ),
                      )
                    : const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(FlaticonIcons.checkCircle, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Bron qilish',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 1. Tour Summary Hero Card
  Widget _buildTourSummaryCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image
          Stack(
            children: [
              Image.network(
                widget.tour.img,
                height: 140,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 140,
                  color: AppTheme.subtleDark,
                  child: const Center(
                    child: Icon(
                      FlaticonIcons.hotel,
                      size: 40,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ),
              ),
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.black54,
                        Colors.transparent,
                        Colors.black87,
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 10,
                left: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    widget.tour.tag.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.65),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        FlaticonIcons.star,
                        size: 12,
                        color: AppTheme.accentGold,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.tour.rating}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                bottom: 10,
                left: 12,
                right: 12,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.tour.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.tour.location,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Details List Inside Card
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(
                      FlaticonIcons.flightTakeoff,
                      size: 14,
                      color: AppTheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        widget.tour.flight,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Text(
                      widget.tour.nights,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
                const Divider(height: 18, color: AppTheme.borderDark),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          FlaticonIcons.restaurantOutlined,
                          size: 14,
                          color: AppTheme.textSub,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          widget.tour.mealType.isNotEmpty
                              ? widget.tour.mealType
                              : 'All Inclusive (Hammasi ichida)',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textSub,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      widget.tour.tourOperator.isNotEmpty
                          ? widget.tour.tourOperator
                          : 'Kompas Tour',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 2. Sayohatchilar Tarkibi va Soni
  Widget _buildTravelersCountSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(
                    FlaticonIcons.peopleOutline,
                    size: 18,
                    color: AppTheme.primary,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Sayohatchilar tarkibi va soni',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Jami: $_totalGuests kishi',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Katta odamlar
          _buildCounterRow(
            icon: FlaticonIcons.personOutline,
            title: 'Katta yoshdagilar',
            subtitle: '12 yoshdan yuqori (To\'liq narx: \$$_perAdult)',
            count: _adultsCount,
            color: AppTheme.primary,
            onMinus: () => _updateAdults(-1),
            onPlus: () => _updateAdults(1),
          ),
          const SizedBox(height: 10),

          // Bolalar
          _buildCounterRow(
            icon: FlaticonIcons.childCare,
            title: 'Yosh bolalar',
            subtitle: '0-11 yosh (50% chegirmada: \$$_perChild)',
            count: _childrenCount,
            color: AppTheme.accentGreen,
            onMinus: () => _updateChildren(-1),
            onPlus: () => _updateChildren(1),
          ),
        ],
      ),
    );
  }

  Widget _buildCounterRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required int count,
    required Color color,
    required VoidCallback onMinus,
    required VoidCallback onPlus,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.subtleDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
                ),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.borderDark),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove, size: 16),
                  onPressed: onMinus,
                  constraints: const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),
                  padding: EdgeInsets.zero,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text(
                    '$count',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add, size: 16),
                  onPressed: onPlus,
                  constraints: const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),
                  padding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 3. Asosiy Sayohatchi Ma'lumotlari
  Widget _buildLeadTravelerSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                FlaticonIcons.badgeOutlined,
                size: 18,
                color: AppTheme.primary,
              ),
              SizedBox(width: 8),
              Text(
                'Asosiy sayohatchi (Buyurtmachi)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Ism Familiya
          TextFormField(
            controller: _nameController,
            textCapitalization: TextCapitalization.words,
            inputFormatters: [
              FilteringTextInputFormatter.allow(_nameCharRegExp),
            ],
            decoration: const InputDecoration(
              labelText: 'Ism va Familiya (pasport bo\'yicha)',
              hintText: 'Masalan: Alisher Yusupov',
              prefixIcon: Icon(FlaticonIcons.personOutline, size: 18),
            ),
          ),
          const SizedBox(height: 10),

          // Telefon
          TextFormField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Telefon raqam',
              hintText: '+998 90 123 45 67',
              prefixIcon: Icon(FlaticonIcons.phoneOutlined, size: 18),
            ),
          ),
          const SizedBox(height: 10),

          // Pasport va Tug'ilgan sana
          Row(
            children: [
              Expanded(
                flex: 3,
                child: TextFormField(
                  controller: _passportController,
                  textCapitalization: TextCapitalization.characters,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9 ]')),
                    LengthLimitingTextInputFormatter(10),
                    _BookingPassportFormatter(),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'Pasport seriya / raqam',
                    hintText: 'AA 1234567',
                    prefixIcon: Icon(FlaticonIcons.badgeOutlined, size: 18),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: GestureDetector(
                  onTap: _pickDateOfBirth,
                  child: AbsorbPointer(
                    child: TextFormField(
                      controller: _dobController,
                      decoration: const InputDecoration(
                        labelText: 'Tug\'ilgan sana',
                        hintText: 'KK.OO.YYYY',
                        prefixIcon: Icon(FlaticonIcons.calendarMonth, size: 16),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 4. Qo'shimcha Sayohatchilar
  Widget _buildExtraTravelersSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                FlaticonIcons.peopleOutline,
                size: 18,
                color: AppTheme.accentSky,
              ),
              const SizedBox(width: 8),
              Text(
                'Qo\'shimcha sayohatchilar (${_totalGuests - 1} kishi)',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _extraNameControllers.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final travelerNum = index + 2;
              final isChild = travelerNum > _adultsCount;

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '$travelerNum-sayohatchi',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: isChild
                                ? AppTheme.accentGreen.withOpacity(0.15)
                                : AppTheme.primary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isChild ? 'Yosh bola' : 'Katta',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isChild
                                  ? AppTheme.accentGreen
                                  : AppTheme.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _extraNameControllers[index],
                      textCapitalization: TextCapitalization.words,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(_nameCharRegExp),
                      ],
                      decoration: InputDecoration(
                        isDense: true,
                        labelText: 'Ism va Familiya',
                        hintText: 'Pasport bo\'yicha',
                        fillColor: AppTheme.surfaceDark,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _extraPassportControllers[index],
                      textCapitalization: TextCapitalization.characters,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9 ]')),
                        LengthLimitingTextInputFormatter(10),
                        _BookingPassportFormatter(),
                      ],
                      decoration: InputDecoration(
                        isDense: true,
                        labelText: 'Pasport seriya / raqam',
                        hintText: 'Masalan: FA 9876543',
                        fillColor: AppTheme.surfaceDark,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 5. Turpaketga Kiritilgan Xizmatlar
  Widget _buildInclusionsSection() {
    final inclusions = [
      {
        'title': 'To\'g\'ridan-to\'g\'ri charter aviachipta',
        'sub': 'Toshkentdan borish va qaytish',
        'icon': FlaticonIcons.airplanemodeActive,
      },
      {
        'title': '20 kg bagaj + 7 kg qo\'l yuki',
        'sub': 'Har bir yo\'lovchi uchun bepul',
        'icon': FlaticonIcons.luggage,
      },
      {
        'title': 'Aeroport — Mehmonxona — Aeroport',
        'sub': 'Konditsionerli qulay guruhli transfer',
        'icon': FlaticonIcons.flightTakeoff,
      },
      {
        'title': 'Xalqaro sayohat sug\'urtasi',
        'sub': 'COVID-19 va shoshilinch holatlarni qoplaydi',
        'icon': FlaticonIcons.shieldOutlined,
      },
      {
        'title': 'Mehmonxonada ovqatlanish',
        'sub': 'Tanlangan taomnoma (All Inclusive)',
        'icon': FlaticonIcons.restaurantOutlined,
      },
      {
        'title': '24/7 SayrHub xizmati',
        'sub': 'Tur davomida doimiy qo\'llab-quvvatlash',
        'icon': FlaticonIcons.supportAgent,
      },
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                FlaticonIcons.checkCircle,
                size: 18,
                color: AppTheme.accentGreen,
              ),
              SizedBox(width: 8),
              Text(
                'Turpaketga to\'liq kiritilgan xizmatlar',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...inclusions.map((inc) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppTheme.accentGreen.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      inc['icon'] as IconData,
                      size: 15,
                      color: AppTheme.accentGreen,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          inc['title'] as String,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          inc['sub'] as String,
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppTheme.textSub,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    FlaticonIcons.checkCircle,
                    size: 14,
                    color: AppTheme.accentGreen,
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // 6. To'lov Usullari
  Widget _buildPaymentMethodsSection() {
    final paymentMethods = [
      {'id': 'Payme', 'name': 'Payme', 'icon': FlaticonIcons.creditCard},
      {'id': 'Click', 'name': 'Click Up', 'icon': FlaticonIcons.creditCard},
      {
        'id': 'Uzum Bank',
        'name': 'Uzum Bank',
        'icon': FlaticonIcons.accountBalance,
      },
      {
        'id': 'Humo/Uzcard',
        'name': 'Humo / Uzcard',
        'icon': FlaticonIcons.creditCard,
      },
      {
        'id': 'Visa',
        'name': 'Visa / Mastercard',
        'icon': FlaticonIcons.creditCard,
      },
      {
        'id': 'Cash',
        'name': 'Ofisda naqd',
        'icon': FlaticonIcons.paymentsOutlined,
      },
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(FlaticonIcons.creditCard, size: 18, color: AppTheme.primary),
              SizedBox(width: 8),
              Text(
                'To\'lov usulini tanlang',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: paymentMethods.map((m) {
              final isSelected = _selectedPayment == m['id'];
              return GestureDetector(
                onTap: () =>
                    setState(() => _selectedPayment = m['id'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary : AppTheme.subtleDark,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected
                          ? AppTheme.primary
                          : AppTheme.borderDark,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        m['icon'] as IconData,
                        size: 14,
                        color: isSelected ? Colors.white : AppTheme.textSub,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        m['name'] as String,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppTheme.textMain,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),

          if (_savedCards.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(color: AppTheme.borderDark),
            const SizedBox(height: 6),
            const Text(
              'Saqlangan to\'lov kartalaringiz:',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSub,
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 48,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _savedCards.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final card = _savedCards[idx];
                  final isCardSel = _selectedCardId == card.id;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedCardId = card.id;
                        _selectedPayment = card.type;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: isCardSel
                            ? AppTheme.primary.withOpacity(0.12)
                            : AppTheme.subtleDark,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isCardSel
                              ? AppTheme.primary
                              : AppTheme.borderDark,
                          width: isCardSel ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            FlaticonIcons.creditCard,
                            size: 16,
                            color: isCardSel
                                ? AppTheme.primary
                                : AppTheme.textSub,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${card.type} •••• ${card.last4}',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isCardSel
                                  ? AppTheme.primary
                                  : AppTheme.textMain,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 7. Narx Taqsimoti va Smeta
  Widget _buildPriceBreakdownSection(String formattedUzs) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                FlaticonIcons.receiptLong,
                size: 18,
                color: AppTheme.primary,
              ),
              SizedBox(width: 8),
              Text(
                'Narx taqsimoti va to\'lov smetasi',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Katta yoshdagilar ($_adultsCount kishi × \$$_perAdult):',
                style: const TextStyle(fontSize: 12, color: AppTheme.textSub),
              ),
              Text(
                '\$${_adultsCount * _perAdult}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          if (_childrenCount > 0) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Yosh bolalar ($_childrenCount bola × \$$_perChild):',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.accentGreen,
                  ),
                ),
                Text(
                  '\$${_childrenCount * _perChild}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.accentGreen,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 6),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Aviaparvoz, transfer va sug\'urta:',
                style: TextStyle(fontSize: 12, color: AppTheme.textSub),
              ),
              Text(
                'Bepul kiritilgan ✓',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.accentGreen,
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Agentlik xizmati (+${widget.tour.markupValue.toStringAsFixed(widget.tour.markupValue.truncateToDouble() == widget.tour.markupValue ? 0 : 1)}%):',
                style: const TextStyle(fontSize: 12, color: AppTheme.primary),
              ),
              const Text(
                'Narxga kiritilgan',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primary,
                ),
              ),
            ],
          ),

          const Divider(height: 20, color: AppTheme.borderDark),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Jami to\'lov summasi:',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
              ),
              Text(
                '\$$_totalPrice',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Taxminan: $formattedUzs so\'m',
              style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
            ),
          ),
        ],
      ),
    );
  }

  // 8. Success View (Dedicated Screen)
  Widget _buildSuccessScreen(Booking booking) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            children: [
              const SizedBox(height: 20),
              // Success Icon Circle
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.accentGreen.withOpacity(0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.accentGreen, width: 2),
                ),
                child: const Center(
                  child: Icon(
                    FlaticonIcons.checkCircle,
                    size: 48,
                    color: AppTheme.accentGreen,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Turni bron qilish yakunlandi!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.textMain,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              const Text(
                'Buyurtmangiz tizimda muvaffaqiyatli ro\'yxatga olindi va vaucher rasmiylashtirildi.',
                style: TextStyle(fontSize: 13, color: AppTheme.textSub),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Voucher Details Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.borderDark),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Voucher ID row with copy button
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.subtleDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.borderDark),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Vaucher raqami',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: AppTheme.textSub,
                                ),
                              ),
                              Text(
                                booking.voucherId,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(
                              FlaticonIcons.receiptLong,
                              size: 18,
                              color: AppTheme.primary,
                            ),
                            onPressed: () => _copyToClipboard(
                              booking.voucherId,
                              'Vaucher ID',
                            ),
                            tooltip: 'Nusxa olish',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    _buildReceiptRow('Mehmonxona:', booking.tourTitle),
                    _buildReceiptRow('Yo\'nalish:', booking.dest),
                    _buildReceiptRow('Sayohatchi:', booking.travelerName),
                    _buildReceiptRow(
                      'Sayohatchilar:',
                      '${booking.guestsCount} kishi (${booking.adultsCount} katta${booking.childrenCount > 0 ? ', ${booking.childrenCount} bola' : ''})',
                    ),
                    _buildReceiptRow('To\'lov summasi:', booking.price),
                    _buildReceiptRow(
                      'Holati:',
                      booking.status,
                      valueColor: AppTheme.accentGreen,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Action Buttons
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    final provider = Provider.of<AppProvider>(
                      context,
                      listen: false,
                    );
                    provider.setTabIndex(3); // Switch to "Turlarim" tab
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  icon: const Icon(FlaticonIcons.luggage, size: 18),
                  label: const Text('Turlarim bo\'limiga o\'tish'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _shareOnTelegram(booking),
                  icon: const Icon(
                    FlaticonIcons.sendRounded,
                    size: 18,
                    color: Color(0xFF229ED9),
                  ),
                  label: const Text('Telegram orqali vaucherni saqlash'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              TextButton(
                onPressed: () {
                  Provider.of<AppProvider>(context, listen: false).setTabIndex(0);
                  Navigator.of(context).popUntil((route) => route.isFirst);
                },
                child: const Text('Bosh sahifaga qaytish'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppTheme.textSub),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: valueColor ?? AppTheme.textMain,
              ),
              textAlign: TextAlign.end,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingPassportFormatter extends TextInputFormatter {
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
