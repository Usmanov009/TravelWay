import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  // ---- Auth / session (JWT) ----
  bool get isAuthenticated => apiService.isAuthenticated;
  String? get authToken => apiService.authToken;

  String _userName = '';
  String get userName => _userName;

  String _userPhone = '';
  String get userPhone => _userPhone;

  String _userTcId = '';
  String get userTcId => _userTcId;

  String _userPassport = '';
  String get userPassport => _userPassport;

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

  String _selectedResort = 'Barcha kurortlar';
  String get selectedResort => _selectedResort;

  int? _nightsCount = 7;
  int? get nightsCount => _nightsCount;

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
  List<PriceAlert> _alerts = [];
  List<PriceAlert> get alerts => _alerts;

  // Saved / Favorites
  final Set<String> _favoriteIds = {};
  bool isFavorite(String id) => _favoriteIds.contains(id);

  AppProvider({bool autoInit = true}) {
    if (autoInit) {
      initApp();
    }
  }

  Future<void> initApp() async {
    await apiService.ready;
    await loadSession();
    await checkConnectivity();
    loadTours();
    loadHotDeals();
    loadServices();
    await loadBookings();
    await loadPriceAlerts();
  }

  // ---- Session / auth ----

  Future<void> loadSession() async {
    await apiService.ready;
    if (!isAuthenticated) {
      await _restoreLocalPrefs();
      notifyListeners();
      return;
    }
    final remote = await apiService.fetchCurrentUser();
    if (remote != null) {
      _applyUser(remote);
      await _persistUser();
    } else {
      await _restoreLocalPrefs();
    }
    notifyListeners();
  }

  Future<void> _restoreLocalPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _userName = prefs.getString('sayrhub_user_name') ?? '';
      _userPhone = prefs.getString('sayrhub_user_phone') ?? '';
      _userTcId = prefs.getString('sayrhub_user_id') ?? '';
      _userPassport = prefs.getString('sayrhub_user_passport') ?? '';
    } catch (_) {}
  }

  Future<void> _persistUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('sayrhub_is_logged_in', isAuthenticated);
      await prefs.setString('sayrhub_user_name', _userName);
      await prefs.setString('sayrhub_user_phone', _userPhone);
      await prefs.setString('sayrhub_user_id', _userTcId);
      await prefs.setString('sayrhub_user_passport', _userPassport);
    } catch (_) {}
  }

  void _applyUser(Map<String, dynamic> user) {
    _userName = user['name']?.toString() ?? _userName;
    _userPhone = user['phone']?.toString() ?? _userPhone;
    _userTcId = user['tcId']?.toString() ?? _userTcId;
    _userPassport = user['passportNumber']?.toString() ?? _userPassport;
  }

  /// Telegram OTP kodini tasdiqlaydi: JWT saqlanadi, profil DB'dan yuklanadi.
  Future<AuthResult> verifyTelegramLogin({
    required String code,
    required String sessionToken,
  }) async {
    final result = await apiService.verifyTelegramCode(
      code: code,
      sessionToken: sessionToken,
    );
    if (result.success && result.user != null) {
      _applyUser(result.user!);
      await _persistUser();
      notifyListeners();
      await loadBookings();
      await loadPriceAlerts();
    }
    return result;
  }

  /// Profilni DB'ga (JWT egasi sifatida) saqlaydi.
  Future<bool> updateProfile({
    required String name,
    required String phone,
    String? passport,
    String? tcId,
  }) async {
    _userName = name.trim();
    _userPhone = phone.trim();
    if (passport != null) _userPassport = passport.trim();
    if (tcId != null && tcId.isNotEmpty) _userTcId = tcId;

    await _persistUser();
    notifyListeners();

    if (!isAuthenticated || _userTcId.isEmpty) return false;

    final ok = await apiService.saveUserProfile({
      'tcId': _userTcId,
      'name': _userName,
      'phone': _userPhone,
      'passportNumber': _userPassport,
      'passportExpiry': '',
      'dob': '',
      'email': '',
      'isVerified': true,
    });
    if (ok) await loadSession();
    return ok;
  }

  Future<void> logout() async {
    await apiService.clearAuthToken();
    _userName = '';
    _userPhone = '';
    _userTcId = '';
    _userPassport = '';
    _bookings.clear();
    _alerts.clear();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('sayrhub_is_logged_in', false);
      await prefs.remove('sayrhub_user_name');
      await prefs.remove('sayrhub_user_phone');
      await prefs.remove('sayrhub_user_id');
      await prefs.remove('sayrhub_user_passport');
    } catch (_) {}
    notifyListeners();
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
      _selectedResort = 'Barcha kurortlar';
      notifyListeners();
      loadTours();
    }
  }

  void setResort(String resort) {
    if (_selectedResort != resort) {
      _selectedResort = resort;
      notifyListeners();
      loadTours();
    }
  }

  void setNightsCount(int? n) {
    if (_nightsCount != n) {
      _nightsCount = n;
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

    if (_nightsCount != null && _nightsCount! > 0) {
      list = list.where((t) {
        if (t.nightsCount == _nightsCount) return true;
        final match = RegExp(r'\d+').firstMatch(t.nights);
        if (match != null && int.tryParse(match.group(0)!) == _nightsCount) {
          return true;
        }
        return false;
      }).toList();
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
        resort: _selectedResort == 'Barcha kurortlar' ? '' : _selectedResort,
        query: _searchQuery,
        nightsFrom: _nightsCount ?? 5,
        nightsTill: _nightsCount ?? 14,
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
    if (!isAuthenticated) return;
    _isLoadingBookings = true;
    notifyListeners();

    try {
      _bookings = await apiService.getBookings();
    } catch (_) {}

    _isLoadingBookings = false;
    notifyListeners();
  }

  Future<void> loadPriceAlerts() async {
    if (!isAuthenticated) return;
    try {
      final remote = await apiService.getPriceAlerts();
      _alerts
        ..clear()
        ..addAll(remote);
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> createBooking(Booking booking) async {
    final success = await apiService.createBooking(booking);
    if (success) {
      _bookings.insert(0, booking);
      notifyListeners();
    }
    return success;
  }

  Future<bool> cancelBooking(String bookingId, {String reason = "Mijoz tomonidan bekor qilindi"}) async {
    final idx = _bookings.indexWhere((b) => b.id == bookingId);
    if (idx != -1) {
      final old = _bookings[idx];
      final updated = Booking(
        id: old.id,
        tourTitle: old.tourTitle,
        dest: old.dest,
        dates: old.dates,
        status: 'Bekor qilingan',
        voucherId: old.voucherId,
        price: old.price,
        totalNumeric: old.totalNumeric,
        travelerName: old.travelerName,
        type: 'cancelled',
        startDate: old.startDate,
        endDate: old.endDate,
        hotelImg: old.hotelImg,
        flight: old.flight,
        airline: old.airline,
        nightsCount: old.nightsCount,
        passport: old.passport,
        phone: old.phone,
        guestsCount: old.guestsCount,
        adultsCount: old.adultsCount,
        childrenCount: old.childrenCount,
        cancellationReason: reason,
      );
      _bookings[idx] = updated;
      notifyListeners();
      try {
        await apiService.cancelBooking(bookingId, reason: reason);
      } catch (_) {}
      return true;
    }
    return false;
  }

  void removeBooking(String bookingId) {
    _bookings.removeWhere((b) => b.id == bookingId);
    notifyListeners();
  }

  Future<bool> createPriceAlert(PriceAlert alert) async {
    final success = await apiService.createPriceAlert(alert);
    _alerts.insert(0, alert);
    notifyListeners();
    return success;
  }

  Future<bool> deletePriceAlert(String alertId) async {
    _alerts.removeWhere((a) => a.id == alertId);
    notifyListeners();
    return await apiService.deletePriceAlert(alertId);
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
