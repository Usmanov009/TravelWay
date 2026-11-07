import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/tour_package.dart';
import '../models/hot_deal.dart';
import '../models/combo_tour.dart';
import '../models/flight_ticket.dart';
import '../models/hotel_only.dart';
import '../models/booking.dart';
import '../models/price_alert.dart';

class ApiService {
  static const String _defaultUrlKey = 'sayrhub_backend_url';

  final http.Client _client;

  // Default base URL:
  // Points to live Render backend for mobile app and web
  static String defaultBaseUrl = 'https://travelway-9x8l.onrender.com';
  String _baseUrl = defaultBaseUrl;

  String get baseUrl => _baseUrl;

  /// JWT — `/api/db/*` endpointlari uchun majburiy (Telegram login orqali olinadi).
  static const String _authTokenKey = 'sayrhub_auth_token';
  String? _authToken;
  String? get authToken => _authToken;
  bool get isAuthenticated => (_authToken ?? '').isNotEmpty;

  Map<String, String> _headers({bool json = false}) {
    final headers = <String, String>{};
    if (json) headers['Content-Type'] = 'application/json';
    final token = _authToken;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<void> setAuthToken(String? token) async {
    final clean = (token ?? '').trim();
    _authToken = clean.isEmpty ? null : clean;
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_authToken == null) {
        await prefs.remove(_authTokenKey);
        await prefs.remove('travelway_auth_token');
      } else {
        await prefs.setString(_authTokenKey, _authToken!);
      }
    } catch (_) {}
  }

  Future<void> clearAuthToken() => setAuthToken(null);

  ApiService({http.Client? client}) : _client = client ?? http.Client() {
    _initFuture = _initUrl();
  }

  Future<void>? _initFuture;

  /// Prefs (base URL + JWT) yuklanishini kutish uchun.
  Future<void> get ready => _initFuture ??= _initUrl();

  Future<void> _initUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_defaultUrlKey) ?? prefs.getString('travelway_backend_url');
      if (saved != null && saved.isNotEmpty) {
        _baseUrl = saved;
      }
      final token = prefs.getString(_authTokenKey) ?? prefs.getString('travelway_auth_token');
      if (token != null && token.isNotEmpty) {
        _authToken = token;
      }
    } catch (_) {}
  }

  Future<void> setBaseUrl(String url) async {
    _baseUrl = url.trim().replaceAll(RegExp(r'/+$'), '');
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_defaultUrlKey, _baseUrl);
    } catch (_) {}
  }

  // 1. Health & Server Status Check
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final res = await _client.get(Uri.parse('$_baseUrl/api/health')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        return {'online': true, ...jsonDecode(res.body)};
      }
    } catch (e) {
      debugPrint('Health check failed: $e');
    }
    return {'online': false, 'error': 'Serverga ulanib bo\'lmadi'};
  }

  // 2. Kompas Live Status
  Future<bool> checkKompasStatus() async {
    try {
      final res = await _client.get(Uri.parse('$_baseUrl/api/kompas/status')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['connected'] == true;
      }
    } catch (_) {}
    return false;
  }

  // 3. Search Kompas Tours (Live via backend, with direct fallback)
  Future<List<TourPackage>> searchTours({
    String departure = '26',
    String country = 'TR',
    String query = '',
    String resort = '',
    int adult = 2,
    int child = 0,
    int nightsFrom = 6,
    int nightsTill = 10,
    String? checkinBeg,
    String? checkinEnd,
  }) async {
    try {
      final qParams = {
        'departure': departure,
        'country': country,
        'q': query,
        'resort': resort,
        'adult': adult.toString(),
        'child': child.toString(),
        'nights_from': nightsFrom.toString(),
        'nights_till': nightsTill.toString(),
      };
      if (checkinBeg != null) qParams['checkin_beg'] = checkinBeg;
      if (checkinEnd != null) qParams['checkin_end'] = checkinEnd;

      final uri = Uri.parse('$_baseUrl/api/kompas/search').replace(queryParameters: qParams);
      final res = await _client.get(uri).timeout(const Duration(seconds: 12));

      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['tours'] is List) {
          return (data['tours'] as List).map((t) => TourPackage.fromJson(t)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error searching live tours via backend: $e. Falling back to direct Kompas query.');
    }

    // Direct fallback from mobile/desktop to online.uz.kompastour.com if backend is unreachable
    return await _directKompasSearch(departure: departure, country: country, adult: adult);
  }

  // 4. Live Hot Sales
  Future<List<HotDeal>> getHotDeals() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/kompas/hot');
      final res = await _client.get(uri).timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['hotDeals'] is List) {
          return (data['hotDeals'] as List).map((h) => HotDeal.fromJson(h)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching live hot deals: $e');
    }
    return [];
  }

  // 5. Combo Tours
  Future<List<ComboTour>> getComboTours({String query = '', String city = ''}) async {
    try {
      final qParams = <String, String>{};
      if (query.isNotEmpty) qParams['q'] = query;
      if (city.isNotEmpty) qParams['city'] = city;

      final uri = Uri.parse('$_baseUrl/api/combo/tours').replace(queryParameters: qParams);
      final res = await _client.get(uri).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['comboTours'] is List) {
          return (data['comboTours'] as List).map((c) => ComboTour.fromJson(c)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching combo tours: $e');
    }
    return [];
  }

  // 6. Flights (DB katalogi)
  Future<List<FlightTicket>> getFlights({String from = '', String to = '', String airline = ''}) async {
    try {
      final qParams = <String, String>{};
      if (from.isNotEmpty) qParams['from'] = from;
      if (to.isNotEmpty) qParams['to'] = to;
      if (airline.isNotEmpty) qParams['airline'] = airline;

      final uri = Uri.parse('$_baseUrl/api/flights/search')
          .replace(queryParameters: qParams.isEmpty ? null : qParams);
      final res = await _client.get(uri).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['flights'] is List) {
          return (data['flights'] as List).map((f) => FlightTicket.fromJson(f)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching flights: $e');
    }
    return [];
  }

  // 7. Hotels Only (DB katalogi)
  Future<List<HotelOnly>> getHotelsOnly({String country = '', String resort = '', String query = ''}) async {
    try {
      final qParams = <String, String>{};
      if (country.isNotEmpty) qParams['country'] = country;
      if (resort.isNotEmpty) qParams['resort'] = resort;
      if (query.isNotEmpty) qParams['q'] = query;

      final uri = Uri.parse('$_baseUrl/api/hotels/search')
          .replace(queryParameters: qParams.isEmpty ? null : qParams);
      final res = await _client.get(uri).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['hotels'] is List) {
          return (data['hotels'] as List).map((h) => HotelOnly.fromJson(h)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching hotels: $e');
    }
    return [];
  }

  // 8. Bookings (DB)
  Future<List<Booking>> getBookings({String? travelerId, String? phone, String? voucherId}) async {
    try {
      final qParams = <String, String>{};
      if (travelerId != null && travelerId.isNotEmpty) qParams['travelerId'] = travelerId;
      if (phone != null && phone.isNotEmpty) qParams['phone'] = phone;
      if (voucherId != null && voucherId.isNotEmpty) qParams['voucherId'] = voucherId;

      final uri = Uri.parse('$_baseUrl/api/db/bookings')
          .replace(queryParameters: qParams.isEmpty ? null : qParams);
      final res = await _client
          .get(uri, headers: _headers())
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['bookings'] is List) {
          return (data['bookings'] as List).map((b) => Booking.fromJson(b)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching bookings from DB: $e');
    }
    return [];
  }

  Future<bool> createBooking(Booking booking) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/db/bookings');
      final res = await _client.post(
        uri,
        headers: _headers(json: true),
        body: jsonEncode(booking.toJson()),
      ).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (e) {
      debugPrint('Error creating booking: $e');
    }
    return false;
  }

  Future<bool> cancelBooking(String bookingId, {String reason = "Mijoz tomonidan bekor qilindi"}) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/db/bookings/$bookingId');
      final res = await _client.put(
        uri,
        headers: _headers(json: true),
        body: jsonEncode({
          'status': 'Bekor qilingan',
          'type': 'cancelled',
          'cancellationReason': reason,
        }),
      ).timeout(const Duration(seconds: 8));

      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error cancelling booking: $e');
    }
    return false;
  }

  // 9. Price Alerts (DB)
  Future<List<PriceAlert>> getPriceAlerts({String? userId}) async {
    try {
      final qParams = <String, String>{};
      if (userId != null && userId.isNotEmpty) qParams['userId'] = userId;

      final uri = Uri.parse('$_baseUrl/api/db/price-alerts')
          .replace(queryParameters: qParams.isEmpty ? null : qParams);
      final res = await _client
          .get(uri, headers: _headers())
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['alerts'] is List) {
          return (data['alerts'] as List).map((a) => PriceAlert.fromJson(a)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching price alerts: $e');
    }
    return [];
  }

  Future<bool> createPriceAlert(PriceAlert alert) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/db/price-alerts');
      final res = await _client.post(
        uri,
        headers: _headers(json: true),
        body: jsonEncode(alert.toJson()),
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (e) {
      debugPrint('Error saving price alert: $e');
    }
    return false;
  }

  // 10. Telegram autentifikatsiyasi va foydalanuvchi profili (DB)
  Future<String?> createTelegramSession() async {
    try {
      final res = await _client
          .post(Uri.parse('$_baseUrl/api/auth/telegram/create-session'))
          .timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true) return data['sessionToken']?.toString();
      }
    } catch (e) {
      debugPrint('Error creating Telegram session: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>> checkTelegramSession(String sessionToken) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/auth/telegram/check-session')
          .replace(queryParameters: {'sessionToken': sessionToken});
      final res = await _client.get(uri).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('Error checking Telegram session: $e');
    }
    return {'success': false, 'authenticated': false};
  }

  /// 4 xonali kodni tasdiqlaydi va JWT'ni saqlaydi.
  Future<AuthResult> verifyTelegramCode({
    required String code,
    required String sessionToken,
  }) async {
    try {
      final res = await _client
          .post(
            Uri.parse('$_baseUrl/api/auth/telegram/verify-code'),
            headers: _headers(json: true),
            body: jsonEncode({'code': code, 'sessionToken': sessionToken}),
          )
          .timeout(const Duration(seconds: 8));

      final data = jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
      final token = data['token']?.toString();
      if (data['success'] == true && token != null && token.isNotEmpty) {
        await setAuthToken(token);
      }
      return AuthResult(
        success: data['success'] == true,
        error: data['error']?.toString(),
        user: data['user'] is Map
            ? Map<String, dynamic>.from(data['user'] as Map)
            : null,
        token: token,
      );
    } catch (e) {
      return AuthResult(success: false, error: 'Tarmoq xatosi: $e');
    }
  }

  /// JWT egasining profilini DB'dan oladi.
  Future<Map<String, dynamic>?> fetchCurrentUser() async {
    if (!isAuthenticated) return null;
    try {
      final res = await _client
          .get(Uri.parse('$_baseUrl/api/db/users/me'), headers: _headers())
          .timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['user'] is Map) {
          return Map<String, dynamic>.from(data['user'] as Map);
        }
      }
    } catch (e) {
      debugPrint('Error fetching current user: $e');
    }
    return null;
  }

  /// Profilni DB'ga yozadi (server faqat JWT egasi profilini qabul qiladi).
  Future<bool> saveUserProfile(Map<String, dynamic> profile) async {
    if (!isAuthenticated) return false;
    try {
      final res = await _client
          .post(
            Uri.parse('$_baseUrl/api/db/users'),
            headers: _headers(json: true),
            body: jsonEncode(profile),
          )
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        return data['success'] == true;
      }
      debugPrint('saveUserProfile failed: ${res.statusCode} ${res.body}');
    } catch (e) {
      debugPrint('Error saving user profile: $e');
    }
    return false;
  }

  Future<bool> deletePriceAlert(String alertId) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/db/price-alerts/$alertId');
      final res = await _client.delete(uri, headers: _headers()).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (e) {
      debugPrint('Error deleting price alert: $e');
    }
    return false;
  }

  // Direct live parser for Kompas Tour when backend is completely offline
  Future<List<TourPackage>> _directKompasSearch({
    required String departure,
    required String country,
    required int adult,
  }) async {
    final stateMap = {
      'TR': '17',
      'EG': '37',
      'AE': '23',
      'MV': '40',
      'TH': '28',
      'VN': '32',
      'ALL': '17'
    };
    final stateInc = stateMap[country] ?? '17';
    final now = DateTime.now();
    final dBeg = now.add(const Duration(days: 3));
    final dEnd = now.add(const Duration(days: 21));
    final fmt = (DateTime d) => '${d.year}${d.month.toString().padLeft(2, '0')}${d.day.toString().padLeft(2, '0')}';

    final uri = Uri.parse('https://online.uz.kompastour.com/search_tour').replace(queryParameters: {
      'samo_action': 'PRICES',
      'TOWNFROMINC': departure,
      'STATEINC': stateInc,
      'CHECKIN_BEG': fmt(dBeg),
      'CHECKIN_END': fmt(dEnd),
      'NIGHTS_FROM': '6',
      'NIGHTS_TILL': '10',
      'ADULT': adult.toString(),
      'CURRENCY': '2',
    });

    try {
      final res = await _client.get(uri, headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://online.uz.kompastour.com/search_tour',
      }).timeout(const Duration(seconds: 12));

      final match = RegExp(r'samo\.controls\.resultset\)\.ehtml\("([\s\S]*?)"\);').firstMatch(res.body);
      if (match == null) return [];

      final rawHtml = jsonDecode('"${match.group(1)}"') as String;
      final rows = RegExp(r'<tr[^>]*class="[^"]*price_info[^"]*"[^>]*>[\s\S]*?<\/tr>', caseSensitive: false)
          .allMatches(rawHtml);

      final List<TourPackage> list = [];
      int idx = 0;
      for (final r in rows) {
        final row = r.group(0)!;
        final hotelMatch = RegExp(r'<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?', caseSensitive: false)
            .firstMatch(row);
        final hotelName = hotelMatch?.group(1)?.trim() ?? 'Resort Hotel';
        final resort = hotelMatch?.group(2)?.trim() ?? (country == 'TR' ? 'Antalya' : 'Dubay');

        int price = 0;
        final convertedMatch = RegExp(r'data-converted-price-number="([0-9.]+)"').firstMatch(row);
        if (convertedMatch != null) {
          price = double.tryParse(convertedMatch.group(1)!)?.round() ?? 0;
        }
        if (price <= 0) continue;

        final nightsMatch = RegExp(r'data-nights="([^"]+)"').firstMatch(row);
        final nights = int.tryParse(nightsMatch?.group(1) ?? '7') ?? 7;

        final checkinMatch = RegExp(r'data-checkin="([^"]+)"').firstMatch(row);
        final rawDate = checkinMatch?.group(1) ?? '';
        final date = rawDate.length == 8 ? '${rawDate.substring(6, 8)}.${rawDate.substring(4, 6)}.${rawDate.substring(0, 4)}' : rawDate;

        list.add(TourPackage(
          id: 'kmp-direct-$stateInc-$idx',
          title: hotelName,
          location: '$resort, ${country == 'TR' ? 'Turkiya' : country == 'AE' ? 'BAA' : 'Misr'}',
          tag: 'All Inclusive (Hammasi ichida)',
          badgeType: hotelName.contains('5*') ? 'ultra' : 'beach',
          is5Star: hotelName.contains('5*'),
          rating: hotelName.contains('5*') ? 9.6 : 8.8,
          nights: '$nights kecha',
          flight: 'Toshkentdan to\'g\'ridan-to\'g\'ri charter',
          price: price,
          oldPrice: (price * 1.25).round(),
          img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          departureCity: 'Toshkent (TAS)',
          country: country == 'TR' ? 'Turkiya' : 'BAA',
          resort: resort,
          hotelStars: hotelName.contains('5*') ? '5★' : '4★',
          mealType: 'AI',
          mealDesc: 'All Inclusive (Hammasi ichida)',
          roomType: 'Standard Room',
          departureDate: date,
          nightsCount: nights,
          kompasTourCode: 'KOMPAS-UZ-$idx',
          kompasOnlineUrl: 'https://online.uz.kompastour.com/search_tour?TOWNFROMINC=$departure&STATEINC=$stateInc&ADULT=$adult&CURRENCY=2',
          isLiveKompas: true,
        ));
        idx++;
      }
      return list;
    } catch (_) {
      return [];
    }
  }
}

/// Telegram OTP tasdiqlash natijasi.
class AuthResult {
  final bool success;
  final String? error;
  final Map<String, dynamic>? user;
  final String? token;

  const AuthResult({
    required this.success,
    this.error,
    this.user,
    this.token,
  });
}

