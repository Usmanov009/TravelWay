import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/tour_package.dart';
import '../utils/app_theme.dart';
import '../widgets/booking_dialog.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _comboSearchController = TextEditingController();
  String _comboSelectedCity = 'ALL';
  String _comboPriceFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _comboSearchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: const Text('Qo\'shimcha Xizmatlar'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          tabs: const [
            Tab(icon: Icon(Icons.hub_outlined, size: 18), text: 'Combo Turlar'),
            Tab(icon: Icon(Icons.flight, size: 18), text: 'Aviabiletlar'),
            Tab(icon: Icon(Icons.hotel_outlined, size: 18), text: 'Mehmonxona'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. Combo Tours
          _buildComboToursTab(provider),
          // 2. Flights
          _buildFlightsTab(provider),
          // 3. Hotels Only
          _buildHotelsOnlyTab(provider),
        ],
      ),
    );
  }

  Widget _buildComboToursTab(AppProvider provider) {
    if (provider.isLoadingServices) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }
    if (provider.comboTours.isEmpty) {
      return const Center(child: Text('Combo turlar mavjud emas'));
    }

    final Set<String> citySet = {};
    for (final c in provider.comboTours) {
      citySet.addAll(c.cities);
    }
    final allCities = citySet.toList()..sort();

    final q = _comboSearchController.text.trim().toLowerCase();
    final filtered = provider.comboTours.where((combo) {
      if (q.isNotEmpty) {
        final matchesTitle = combo.title.toLowerCase().contains(q);
        final matchesRoute = combo.route.toLowerCase().contains(q);
        final matchesCity = combo.cities.any((c) => c.toLowerCase().contains(q));
        if (!matchesTitle && !matchesRoute && !matchesCity) return false;
      }

      if (_comboSelectedCity != 'ALL') {
        final matchesSelected = combo.cities.any((c) => c.toLowerCase() == _comboSelectedCity.toLowerCase()) ||
            combo.route.toLowerCase().contains(_comboSelectedCity.toLowerCase());
        if (!matchesSelected) return false;
      }

      if (_comboPriceFilter == 'CHEAP' && combo.price >= 900) return false;
      if (_comboPriceFilter == 'LUXURY' && combo.price < 900) return false;

      return true;
    }).toList();

    return Column(
      children: [
        // Filter Header
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
          color: AppTheme.surfaceDark,
          child: Column(
            children: [
              Container(
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.subtleDark,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: TextField(
                  controller: _comboSearchController,
                  style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Combo qidirish...',
                    hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    prefixIcon: const Icon(Icons.search, size: 18, color: AppTheme.primary),
                    suffixIcon: _comboSearchController.text.isNotEmpty
                        ? GestureDetector(
                            onTap: () {
                              _comboSearchController.clear();
                              setState(() {});
                            },
                            child: const Icon(Icons.close, size: 16, color: AppTheme.textSub),
                          )
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildChip('Barchasi', _comboSelectedCity == 'ALL', () => setState(() => _comboSelectedCity = 'ALL')),
                    const SizedBox(width: 6),
                    ...allCities.map((city) => Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: _buildChip(city, _comboSelectedCity == city, () => setState(() => _comboSelectedCity = city)),
                        )),
                    const SizedBox(width: 8),
                    _buildChip('Arzonroq (< \$900)', _comboPriceFilter == 'CHEAP', () => setState(() => _comboPriceFilter = _comboPriceFilter == 'CHEAP' ? 'ALL' : 'CHEAP')),
                    const SizedBox(width: 6),
                    _buildChip('Premium (\$900+)', _comboPriceFilter == 'LUXURY', () => setState(() => _comboPriceFilter = _comboPriceFilter == 'LUXURY' ? 'ALL' : 'LUXURY')),
                  ],
                ),
              ),
            ],
          ),
        ),

        // List
        Expanded(
          child: filtered.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.hub_outlined, size: 40, color: AppTheme.textMuted),
                      const SizedBox(height: 10),
                      const Text('Ushbu filtr bo\'yicha combo turlar topilmadi', style: TextStyle(color: AppTheme.textSub, fontSize: 13)),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _comboSearchController.clear();
                            _comboSelectedCity = 'ALL';
                            _comboPriceFilter = 'ALL';
                          });
                        },
                        child: const Text('Filtrni tozalash'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, idx) {
                    final combo = filtered[idx];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                            child: Image.network(
                              combo.img,
                              height: 140,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(height: 140, color: Colors.grey[850]),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(combo.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                const SizedBox(height: 4),
                                Text(combo.route, style: const TextStyle(color: AppTheme.secondary, fontSize: 12, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  children: combo.cities.map((c) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: AppTheme.cardDark, borderRadius: BorderRadius.circular(6)),
                                    child: Text(c, style: const TextStyle(fontSize: 10, color: Colors.white70)),
                                  )).toList(),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('\$${combo.price}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                                    ElevatedButton(
                                      onPressed: () {
                                        final tempTour = TourPackage(
                                          id: combo.id,
                                          title: combo.title,
                                          location: combo.route,
                                          tag: 'Combo Tur',
                                          nights: '${combo.nights} kecha',
                                          flight: 'Toshkentdan guruhli safar',
                                          price: combo.price,
                                          img: combo.img,
                                          country: combo.cities.isNotEmpty ? combo.cities.first : 'Combo',
                                          resort: combo.cities.join(' - '),
                                        );
                                        showDialog(context: context, builder: (_) => BookingDialog(tour: tempTour));
                                      },
                                      child: const Text('Band qilish'),
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
        ),
      ],
    );
  }

  Widget _buildChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.subtleDark,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.borderDark),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: isSelected ? Colors.white : AppTheme.textSub,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildFlightsTab(AppProvider provider) {
    if (provider.isLoadingServices) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }
    if (provider.flights.isEmpty) {
      return const Center(child: Text('Reyslar topilmadi'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: provider.flights.length,
      itemBuilder: (context, idx) {
        final f = provider.flights[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.airplane_ticket, color: AppTheme.primary, size: 20),
                        const SizedBox(width: 8),
                        Text(f.airline, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: f.flightType == 'charter' ? Colors.orange.withOpacity(0.2) : Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        f.flightType.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: f.flightType == 'charter' ? Colors.orange : Colors.blue,
                        ),
                      ),
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
                        Text(f.departureTime, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text(f.departureCity, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(f.duration, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                        const Row(
                          children: [
                            SizedBox(width: 30, child: Divider(color: AppTheme.borderDark)),
                            Icon(Icons.flight_takeoff, size: 14, color: AppTheme.secondary),
                            SizedBox(width: 30, child: Divider(color: AppTheme.borderDark)),
                          ],
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(f.arrivalTime, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text(f.arrivalCity, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Bagaj: ${f.baggage}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                    Text('\$${f.price}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHotelsOnlyTab(AppProvider provider) {
    if (provider.isLoadingServices) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }
    if (provider.hotels.isEmpty) {
      return const Center(child: Text('Mehmonxonalar topilmadi'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: provider.hotels.length,
      itemBuilder: (context, idx) {
        final h = provider.hotels[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 14),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                child: Image.network(
                  h.img,
                  width: 100,
                  height: 110,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(width: 100, height: 110, color: Colors.grey[850]),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(h.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                      Text('${h.resort}, ${h.country}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                      const SizedBox(height: 4),
                      Text(h.mealDesc, style: const TextStyle(color: AppTheme.secondary, fontSize: 10)),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('\$${h.pricePerNight}/kecha', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(6)),
                            child: Text(h.stars, style: const TextStyle(fontSize: 10, color: Colors.amber)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
