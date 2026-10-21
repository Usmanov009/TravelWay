import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/tour_package.dart';
import '../utils/app_theme.dart';
import '../widgets/booking_dialog.dart';
import '../widgets/price_alert_dialog.dart';
import 'tour_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  // Service mode: 'packages', 'combo', 'flights', 'hotels'
  String _serviceMode = 'packages';

  // Filters
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _nightsController = TextEditingController(text: '7');

  final List<Map<String, String>> _countries = const [
    {'code': 'ALL', 'name': 'Barcha mamlakatlar', 'flag': '🌍'},
    {'code': 'TR', 'name': 'Turkiya', 'flag': '🇹🇷'},
    {'code': 'EG', 'name': 'Misr', 'flag': '🇪🇬'},
    {'code': 'AE', 'name': 'BAA', 'flag': '🇦🇪'},
    {'code': 'TH', 'name': 'Tailand', 'flag': '🇹🇭'},
    {'code': 'VN', 'name': 'Vetnam', 'flag': '🇻🇳'},
    {'code': 'CN', 'name': 'Xitoy', 'flag': '🇨🇳'},
    {'code': 'MV', 'name': 'Maldiv', 'flag': '🇲🇻'},
    {'code': 'ID', 'name': 'Indoneziya', 'flag': '🇮🇩'},
    {'code': 'GE', 'name': 'Gruziya', 'flag': '🇬🇪'},
    {'code': 'LK', 'name': 'Shri-Lanka', 'flag': '🇱🇰'},
    {'code': 'MY', 'name': 'Malayziya', 'flag': '🇲🇾'},
    {'code': 'QA', 'name': 'Qatar', 'flag': '🇶🇦'},
    {'code': 'SA', 'name': 'Saudiya Arabistoni', 'flag': '🇸🇦'},
    {'code': 'OM', 'name': 'Ummon', 'flag': '🇴🇲'},
    {'code': 'AZ', 'name': 'Ozarbayjon', 'flag': '🇦🇿'},
    {'code': 'CY', 'name': 'Kipr', 'flag': '🇨🇾'},
    {'code': 'ME', 'name': 'Chernogoriya', 'flag': '🇲🇪'},
    {'code': 'IT', 'name': 'Italiya', 'flag': '🇮🇹'},
    {'code': 'ES', 'name': 'Ispaniya', 'flag': '🇪🇸'},
    {'code': 'FR', 'name': 'Fransiya', 'flag': '🇫🇷'},
    {'code': 'CZ', 'name': 'Chexiya', 'flag': '🇨🇿'},
    {'code': 'JP', 'name': 'Yaponiya', 'flag': '🇯🇵'},
    {'code': 'KR', 'name': 'Janubiy Koreya', 'flag': '🇰🇷'},
    {'code': 'SC', 'name': 'Seyshel', 'flag': '🇸🇨'},
    {'code': 'MU', 'name': 'Mavrikiy', 'flag': '🇲🇺'},
    {'code': 'IN', 'name': 'Hindiston (Goa)', 'flag': '🇮🇳'},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    _nightsController.dispose();
    super.dispose();
  }

  void _openSearchableCountryPicker(BuildContext context, AppProvider provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        String query = '';
        return StatefulBuilder(
          builder: (context, setModalState) {
            final filtered = _countries.where((c) {
              if (query.isEmpty) return true;
              return c['name']!.toLowerCase().contains(query.toLowerCase()) ||
                     c['code']!.toLowerCase().contains(query.toLowerCase());
            }).toList();

            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.borderDark,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    '🌍 Davlatni tanlang yoki qidiring',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMain,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Search Input (Type bo'lsin)
                  TextField(
                    autofocus: true,
                    style: const TextStyle(color: AppTheme.textMain, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Davlat nomini yozing (masalan: Turkiya)...',
                      hintStyle: const TextStyle(color: AppTheme.textSub, fontSize: 13),
                      prefixIcon: const Icon(Icons.search, color: AppTheme.primary, size: 20),
                      filled: true,
                      fillColor: AppTheme.subtleDark,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: AppTheme.borderDark),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: AppTheme.borderDark),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    onChanged: (val) {
                      setModalState(() => query = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  // Selectable Country List with Flag in front of name
                  Expanded(
                    child: ListView.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const Divider(color: AppTheme.borderDark, height: 1),
                      itemBuilder: (context, idx) {
                        final c = filtered[idx];
                        final isSel = provider.selectedCountry == c['code'];
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          leading: Text(c['flag']!, style: const TextStyle(fontSize: 22)),
                          title: Text(
                            c['name']!,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                              color: isSel ? AppTheme.primary : AppTheme.textMain,
                            ),
                          ),
                          trailing: isSel
                              ? const Icon(Icons.check_circle, color: AppTheme.primary, size: 18)
                              : null,
                          onTap: () {
                            provider.setCountry(c['code']!);
                            Navigator.pop(ctx);
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: RefreshIndicator(
        color: AppTheme.primary,
        backgroundColor: AppTheme.surfaceDark,
        onRefresh: () => provider.loadTours(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Top 4-Service Segment Buttons (Exact Web Match)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Row(
                  children: [
                    _buildSegmentButton('packages', '🏖️', 'Paketlar'),
                    _buildSegmentButton('combo', '🔄', 'Combo'),
                    _buildSegmentButton('flights', '✈️', 'Biletlar'),
                    _buildSegmentButton('hotels', '🏨', 'Mehmonxona'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // 2. Active Mode View
              if (_serviceMode == 'packages')
                _buildPackagesView(provider)
              else if (_serviceMode == 'combo')
                _buildComboToursView(provider)
              else if (_serviceMode == 'flights')
                _buildFlightsView(provider)
              else if (_serviceMode == 'hotels')
                _buildHotelsOnlyView(provider),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSegmentButton(String mode, String icon, String label) {
    final isSelected = _serviceMode == mode;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _serviceMode = mode),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(icon, style: const TextStyle(fontSize: 14)),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : AppTheme.textSub,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- PACKAGES VIEW ---
  Widget _buildPackagesView(AppProvider provider) {
    final tours = provider.filteredTours;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Filter Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Jo'nash shahri & Mamlakat
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🛫 Jo\'nash shahri', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: AppTheme.subtleDark,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderDark),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: provider.selectedDeparture,
                              isExpanded: true,
                              dropdownColor: AppTheme.surfaceDark,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                              items: const [
                                DropdownMenuItem(value: '26', child: Text('Toshkent (TAS)')),
                                DropdownMenuItem(value: '27', child: Text('Samarqand (SKD)')),
                              ],
                              onChanged: (val) {
                                if (val != null) provider.setDeparture(val);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🌙 Kunlar soni (Kechalar)', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.subtleDark,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderDark),
                          ),
                          child: Row(
                            children: [
                              GestureDetector(
                                onTap: () {
                                  final cur = int.tryParse(_nightsController.text) ?? 7;
                                  final next = cur > 1 ? cur - 1 : 1;
                                  _nightsController.text = next.toString();
                                  provider.setNightsCount(next);
                                },
                                child: Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceDark,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Center(
                                    child: Text('-', style: TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold, fontSize: 14)),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: TextField(
                                  controller: _nightsController,
                                  keyboardType: TextInputType.number,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                                  decoration: const InputDecoration(
                                    isDense: true,
                                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                                    border: InputBorder.none,
                                    hintText: '7',
                                    hintStyle: TextStyle(color: AppTheme.textSub),
                                  ),
                                  onSubmitted: (val) {
                                    final n = int.tryParse(val);
                                    provider.setNightsCount(n);
                                  },
                                ),
                              ),
                              const Text('kun', style: TextStyle(fontSize: 10, color: AppTheme.textSub, fontWeight: FontWeight.bold)),
                              const SizedBox(width: 4),
                              GestureDetector(
                                onTap: () {
                                  final cur = int.tryParse(_nightsController.text) ?? 7;
                                  final next = cur + 1;
                                  _nightsController.text = next.toString();
                                  provider.setNightsCount(next);
                                },
                                child: Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceDark,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Center(
                                    child: Text('+', style: TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold, fontSize: 14)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Country Picker (Select ham, Type ham bo'lsin, bayroq nomi oldida)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('🌍 Borish mamlakati (Select & Qidiruv)', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
                  GestureDetector(
                    onTap: () => _openSearchableCountryPicker(context, provider),
                    child: const Text('Barchasi ▾', style: TextStyle(fontSize: 11, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Searchable country card with flag in front of name
              GestureDetector(
                onTap: () => _openSearchableCountryPicker(context, provider),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppTheme.subtleDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.borderDark),
                  ),
                  child: Row(
                    children: [
                      Text(
                        _countries.firstWhere(
                          (c) => c['code'] == provider.selectedCountry,
                          orElse: () => _countries[1],
                        )['flag']!,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _countries.firstWhere(
                            (c) => c['code'] == provider.selectedCountry,
                            orElse: () => _countries[1],
                          )['name']!,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                        ),
                      ),
                      const Icon(Icons.search, size: 16, color: AppTheme.textSub),
                      const SizedBox(width: 4),
                      const Icon(Icons.arrow_drop_down, size: 18, color: AppTheme.textSub),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Country Horizontal Chips
              SizedBox(
                height: 36,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _countries.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, idx) {
                    final c = _countries[idx];
                    final isSel = provider.selectedCountry == c['code'];

                    return GestureDetector(
                      onTap: () => provider.setCountry(c['code']!),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSel ? AppTheme.primary : AppTheme.subtleDark,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isSel ? AppTheme.primary : AppTheme.borderDark),
                        ),
                        child: Row(
                          children: [
                            Text(c['flag']!, style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 6),
                            Text(
                              c['name']!,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSel ? Colors.white : AppTheme.textMain,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),

              // Search Bar
              TextField(
                controller: _searchController,
                style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                decoration: InputDecoration(
                  hintText: 'Shahar yoki mehmonxona qidirish...',
                  prefixIcon: const Icon(Icons.search, size: 18, color: AppTheme.textMuted),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            provider.setSearchQuery('');
                          },
                        )
                      : null,
                ),
                onChanged: (val) => provider.setSearchQuery(val),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Result Stats Bar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Turpaketlar (${tours.length})',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: AppTheme.textMain,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.accentGreen.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.accentGreen.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.bolt, size: 12, color: AppTheme.accentGreen),
                  SizedBox(width: 4),
                  Text(
                    'Jonli 1:1 Narxlar',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentGreen),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Tour Cards List
        if (provider.isLoadingTours)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(
              child: Column(
                children: [
                  CircularProgressIndicator(color: AppTheme.primary),
                  SizedBox(height: 12),
                  Text('Jonli narxlar olinmoqda...', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                ],
              ),
            ),
          )
        else if (tours.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 40),
            alignment: Alignment.center,
            child: const Column(
              children: [
                Icon(Icons.travel_explore, size: 48, color: AppTheme.textMuted),
                SizedBox(height: 10),
                Text('Ushbu filtr bo\'yicha turlar topilmadi', style: TextStyle(color: AppTheme.textSub, fontSize: 13)),
              ],
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: tours.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (context, idx) {
              final tour = tours[idx];
              return _buildTourCard(context, tour, provider);
            },
          ),
      ],
    );
  }

  Widget _buildTourCard(BuildContext context, TourPackage tour, AppProvider provider) {
    final isFav = provider.isFavorite(tour.id);

    return Container(
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
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image & Badges
          Stack(
            children: [
              Image.network(
                tour.img,
                height: 145,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 145,
                  color: AppTheme.subtleDark,
                  child: const Center(child: Icon(Icons.apartment, size: 40, color: AppTheme.textMuted)),
                ),
              ),

              // Gradient Overlay
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.black54, Colors.transparent, Colors.black87],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              // Left Badges
              Positioned(
                top: 10,
                left: 10,
                right: 50,
                child: Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        tour.tag.toUpperCase(),
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                    if (tour.kompasTourCode.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black87,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.accentGreen.withOpacity(0.4)),
                        ),
                        child: Text(
                          tour.kompasTourCode,
                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.accentGreen),
                        ),
                      ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.accentGreen,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.bolt, size: 10, color: Colors.white),
                          SizedBox(width: 2),
                          Text(
                            'Jonli 1:1 Narx',
                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Price Alert Bell & Favorite Icons
              Positioned(
                top: 10,
                right: 48,
                child: GestureDetector(
                  onTap: () {
                    showDialog(context: context, builder: (_) => PriceAlertDialog(tour: tour));
                  },
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white30),
                    ),
                    child: const Icon(Icons.notifications_active_outlined, size: 16, color: Colors.amber),
                  ),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: GestureDetector(
                  onTap: () {
                    provider.toggleFavorite(tour.id);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white30),
                    ),
                    child: Icon(
                      isFav ? Icons.favorite : Icons.favorite_border,
                      size: 16,
                      color: isFav ? AppTheme.accent : Colors.white,
                    ),
                  ),
                ),
              ),

              // Bottom Title & Resort
              Positioned(
                bottom: 10,
                left: 12,
                right: 12,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tour.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 12, color: AppTheme.primary),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  tour.location,
                                  style: const TextStyle(color: Colors.white70, fontSize: 10),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: List.generate(
                        5,
                        (i) => const Icon(Icons.star, size: 12, color: Colors.amber),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Card Body
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                // Flight bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppTheme.subtleDark,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.borderDark),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.flight_takeoff, size: 14, color: AppTheme.accentSky),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          tour.flight,
                          style: const TextStyle(fontSize: 10, color: AppTheme.textSub),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Text(
                        'Transfer ✓ Sug\'urta ✓',
                        style: TextStyle(fontSize: 10, color: AppTheme.accentGreen, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Pricing Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${tour.nights} (${tour.departureCity})',
                          style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '\$${tour.price}',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.primary,
                              ),
                            ),
                            if ((tour.oldPrice ?? 0) > 0) ...[
                              const SizedBox(width: 6),
                              Text(
                                '\$${tour.oldPrice}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  decoration: TextDecoration.lineThrough,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ],
                        ),
                        Text(
                          '~${(tour.price * 12950 / 1000).toStringAsFixed(0)} ming UZS',
                          style: const TextStyle(fontSize: 9, color: AppTheme.accentGreen, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),

                    // Actions
                    Row(
                      children: [

                        OutlinedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => TourDetailScreen(tour: tour)),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Batafsil', style: TextStyle(fontSize: 11)),
                        ),
                        const SizedBox(width: 6),
                        ElevatedButton(
                          onPressed: () {
                            showDialog(context: context, builder: (_) => BookingDialog(tour: tour));
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Band qilish', style: TextStyle(fontSize: 11)),
                        ),
                      ],
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

  // --- COMBO TOURS VIEW ---
  Widget _buildComboToursView(AppProvider provider) {
    if (provider.isLoadingServices) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }
    if (provider.comboTours.isEmpty) {
      return const Center(child: Text('Combo turlar mavjud emas'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Multi-City Header Banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppTheme.primary.withOpacity(0.15), AppTheme.accentSky.withOpacity(0.12)],
            ),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('🔄 Multi-City • 1:1 Rasmiy Paketlar', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('Kombinatsiyalashgan Combo Turlar', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
              SizedBox(height: 4),
              Text('Bitta sayohatda 2 yoki undan ortiq afsonaviy shaharlar. Ichki reyslar, VIP transferlar va mehmonxonalar to\'liq kiritilgan.', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
            ],
          ),
        ),
        const SizedBox(height: 14),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: provider.comboTours.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, idx) {
            final combo = provider.comboTours[idx];
            return Container(
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderDark),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.network(
                    combo.img,
                    height: 135,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(height: 135, color: AppTheme.subtleDark),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(combo.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain)),
                        const SizedBox(height: 4),
                        Text(combo.route, style: const TextStyle(color: AppTheme.accentSky, fontSize: 11, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          children: combo.cities.map((c) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(color: AppTheme.subtleDark, borderRadius: BorderRadius.circular(6)),
                            child: Text(c, style: const TextStyle(fontSize: 9, color: AppTheme.textSub)),
                          )).toList(),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('\$${combo.price}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                            ElevatedButton(
                              onPressed: () {
                                final tempTour = TourPackage(
                                  id: combo.id,
                                  title: combo.title,
                                  location: combo.route,
                                  tag: 'Combo Tur',
                                  nights: '${combo.nights} kecha',
                                  flight: 'Toshkentdan reys',
                                  price: combo.price,
                                  img: combo.img,
                                  country: combo.cities.isNotEmpty ? combo.cities.first : 'Combo',
                                  resort: combo.cities.join(' - '),
                                );
                                showDialog(context: context, builder: (_) => BookingDialog(tour: tempTour));
                              },
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Band qilish', style: TextStyle(fontSize: 11)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // --- FLIGHTS VIEW ---
  Widget _buildFlightsView(AppProvider provider) {
    if (provider.isLoadingServices) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }
    if (provider.flights.isEmpty) {
      return const Center(child: Text('Reyslar mavjud emas'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('✈️ Aviabiletlar • Charter & GDS Bloklar', style: TextStyle(color: AppTheme.accentSky, fontSize: 10, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('To\'g\'ridan-to\'g\'ri Aviachiptalar', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
              SizedBox(height: 4),
              Text('Eksklyuziv charter bloklari va doimiy reyslar. Bagaj (20-23kg) kiritilgan, kafolatlangan o\'rinlar va 1:1 narxlar.', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
            ],
          ),
        ),
        const SizedBox(height: 14),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: provider.flights.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, idx) {
            final f = provider.flights[idx];
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.borderDark),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.flight, color: AppTheme.accentSky, size: 18),
                          const SizedBox(width: 8),
                          Text('${f.airline} (${f.flightNumber})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(color: AppTheme.accentGreen.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                        child: const Text('Kafolatlangan', style: TextStyle(color: AppTheme.accentGreen, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(f.departureCity, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                          Text(f.departureTime, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ],
                      ),
                      const Icon(Icons.arrow_forward, size: 16, color: AppTheme.textMuted),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(f.arrivalCity, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
                          Text(f.arrivalTime, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.luggage, size: 14, color: AppTheme.textMuted),
                          const SizedBox(width: 4),
                          Text(f.baggage, style: const TextStyle(fontSize: 11, color: AppTheme.textSub)),
                        ],
                      ),
                      Row(
                        children: [
                          Text('\$${f.price}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                          const SizedBox(width: 10),
                          ElevatedButton(
                            onPressed: () {
                              final tempTour = TourPackage(
                                id: f.id,
                                title: '${f.airline} ${f.departureCity} - ${f.arrivalCity}',
                                location: '${f.departureCity} ➔ ${f.arrivalCity}',
                                tag: 'Aviabilet',
                                nights: '1 kun',
                                flight: '${f.airline} ${f.flightNumber}',
                                price: f.price,
                                img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60',
                                country: f.arrivalCity,
                                resort: f.arrivalCity,
                              );
                              showDialog(context: context, builder: (_) => BookingDialog(tour: tempTour));
                            },
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Band qilish', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // --- HOTELS ONLY VIEW ---
  Widget _buildHotelsOnlyView(AppProvider provider) {
    if (provider.isLoadingServices) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }
    if (provider.hotels.isEmpty) {
      return const Center(child: Text('Mehmonxonalar mavjud emas'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderDark),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('🏨 Faqat Mehmonxona • 1:1 Narxlar', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('Dunyo Mehmonxonalari', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
              SizedBox(height: 4),
              Text('Chiptani o\'zingiz olganingizda faqat mehmonxonani rasmiy eng arzon narxda band qiling.', style: TextStyle(fontSize: 11, color: AppTheme.textSub)),
            ],
          ),
        ),
        const SizedBox(height: 14),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: provider.hotels.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, idx) {
            final h = provider.hotels[idx];
            return Container(
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderDark),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.network(
                    h.img,
                    height: 135,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(height: 135, color: AppTheme.subtleDark),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(h.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain), maxLines: 1, overflow: TextOverflow.ellipsis),
                            ),
                            Text('${h.stars} ★', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('${h.resort}, ${h.country}', style: const TextStyle(color: AppTheme.textSub, fontSize: 11)),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('\$${h.pricePerNight} / kecha', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                                Text('Jami: \$${h.total7Nights} (7 kecha)', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                              ],
                            ),
                            ElevatedButton(
                              onPressed: () {
                                final tempTour = TourPackage(
                                  id: h.id,
                                  title: h.name,
                                  location: '${h.resort}, ${h.country}',
                                  tag: h.mealType,
                                  nights: '7 kecha',
                                  flight: 'Parvozsiz (faqat mehmonxona)',
                                  price: h.total7Nights,
                                  img: h.img,
                                  country: h.country,
                                  resort: h.resort,
                                );
                                showDialog(context: context, builder: (_) => BookingDialog(tour: tempTour));
                              },
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Band qilish', style: TextStyle(fontSize: 11)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
