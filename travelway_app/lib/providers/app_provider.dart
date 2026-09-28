import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/tour_package.dart';
import '../models/hot_deal.dart';
import '../models/combo_tour.dart';
import '../models/flight_ticket.dart';
import '../models/hotel_only.dart';
import '../models/booking.dart';
import '../models/price_alert.dart';

class AppProvider extends ChangeNotifier {
  final ApiService apiService = ApiService();

  int _currentTabIndex = 0;
  int get currentTabIndex => _currentTabIndex;

  // Server health
  bool _isBackendOnline = false;
  bool get isBackendOnline => _isBackendOnline;

  bool _isKompasOnline = false;
  bool get isKompasOnline => _isKompasOnline;

  // Search state
  List<TourPackage> _tours = [];
  List<TourPackage> get tours => _tours;

  bool _isLoadingTours = false;
  bool get isLoadingTours => _isLoadingTours;

  String _selectedDeparture = '26'; // Toshkent
  String get selectedDeparture => _selectedDeparture;

  String _selectedCountry = 'TR'; // Turkiya
  String get selectedCountry => _selectedCountry;

  String _activeFilter = 'ALL'; // 'ALL', '5STAR', 'CHEAP'
  String get activeFilter => _activeFilter;

  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  // Hot deals
  List<HotDeal> _hotDeals = [];
  List<HotDeal> get hotDeals => _hotDeals;
  bool _isLoadingHotDeals = false;
  bool get isLoadingHotDeals => _isLoadingHotDeals;

  // Services
  List<ComboTour> _comboTours = [];
  List<ComboTour> get comboTours => _comboTours;

  List<FlightTicket> _flights = [];
  List<FlightTicket> get flights => _flights;

  List<HotelOnly> _hotels = [];
  List<HotelOnly> get hotels => _hotels;

  bool _isLoadingServices = false;
  bool get isLoadingServices => _isLoadingServices;

  // Bookings
  List<Booking> _bookings = [];
  List<Booking> get bookings => _bookings;
  bool _isLoadingBookings = false;
  bool get isLoadingBookings => _isLoadingBookings;

  // Price Alerts
  final List<PriceAlert> _alerts = [];
  List<PriceAlert> get alerts => _alerts;

  // Saved / Favorites
  final Set<String> _favoriteIds = {};
  bool isFavorite(String id) => _favoriteIds.contains(id);

  AppProvider() {
    initApp();
  }

  Future<void> initApp() async {
    await checkConnectivity();
    loadTours();
    loadHotDeals();
    loadServices();
    loadBookings();
  }

  void setTabIndex(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }

  Future<void> checkConnectivity() async {
    final health = await apiService.checkHealth();
    _isBackendOnline = health['online'] == true;
    _isKompasOnline = await apiService.checkKompasStatus();
    notifyListeners();
  }

  Future<void> updateBackendUrl(String newUrl) async {
    await apiService.setBaseUrl(newUrl);
    await checkConnectivity();
    loadTours();
    loadHotDeals();
  }

  void setDeparture(String departure) {
    if (_selectedDeparture != departure) {
      _selectedDeparture = departure;
      notifyListeners();
      loadTours();
    }
  }

  void setCountry(String country) {
    if (_selectedCountry != country) {
      _selectedCountry = country;
      notifyListeners();
      loadTours();
    }
  }

  void setFilter(String filter) {
    _activeFilter = filter;
    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  List<TourPackage> get filteredTours {
    var list = _tours;
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((t) =>
        t.title.toLowerCase().contains(q) ||
        t.location.toLowerCase().contains(q) ||
        t.resort.toLowerCase().contains(q)
      ).toList();
    }

    if (_activeFilter == '5STAR') {
      list = list.where((t) => t.is5Star || t.hotelStars.contains('5')).toList();
    } else if (_activeFilter == 'CHEAP') {
      list = list.where((t) => t.price < 900).toList();
    }

    return list;
  }

  Future<void> loadTours() async {
    _isLoadingTours = true;
    notifyListeners();

    try {
      _tours = await apiService.searchTours(
        departure: _selectedDeparture,
        country: _selectedCountry,
        query: _searchQuery,
      );
    } catch (_) {}

    _isLoadingTours = false;
    notifyListeners();
  }

  Future<void> loadHotDeals() async {
    _isLoadingHotDeals = true;
    notifyListeners();

    try {
      _hotDeals = await apiService.getHotDeals();
    } catch (_) {}

    _isLoadingHotDeals = false;
    notifyListeners();
  }

  Future<void> loadServices() async {
    _isLoadingServices = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        apiService.getComboTours(),
        apiService.getFlights(),
        apiService.getHotelsOnly(),
      ]);
      _comboTours = results[0] as List<ComboTour>;
      _flights = results[1] as List<FlightTicket>;
      _hotels = results[2] as List<HotelOnly>;
    } catch (_) {}

    _isLoadingServices = false;
    notifyListeners();
  }

  Future<void> loadBookings() async {
    _isLoadingBookings = true;
    notifyListeners();

    try {
      _bookings = await apiService.getBookings();
    } catch (_) {}

    _isLoadingBookings = false;
    notifyListeners();
  }

  Future<bool> createBooking(Booking booking) async {
    final success = await apiService.createBooking(booking);
    _bookings.insert(0, booking);
    notifyListeners();
    return success;
  }

  Future<bool> createPriceAlert(PriceAlert alert) async {
    final success = await apiService.createPriceAlert(alert);
    _alerts.insert(0, alert);
    notifyListeners();
    return success;
  }

  void toggleFavorite(String id) {
    if (_favoriteIds.contains(id)) {
      _favoriteIds.remove(id);
    } else {
      _favoriteIds.add(id);
    }
    notifyListeners();
  }
}
