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
  static const String _defaultUrlKey = 'travelway_backend_url';
  
  // Default base URL:
  // On web / desktop: http://localhost:3000
  // On Android emulator: http://10.0.2.2:3000
  static String defaultBaseUrl = 'http://localhost:3000';
  String _baseUrl = defaultBaseUrl;

  String get baseUrl => _baseUrl;

  ApiService() {
    _initUrl();
  }

  Future<void> _initUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_defaultUrlKey);
      if (saved != null && saved.isNotEmpty) {
        _baseUrl = saved;
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
      final res = await http.get(Uri.parse('$_baseUrl/api/health')).timeout(const Duration(seconds: 4));
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
      final res = await http.get(Uri.parse('$_baseUrl/api/kompas/status')).timeout(const Duration(seconds: 4));
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
      final res = await http.get(uri).timeout(const Duration(seconds: 12));

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
      final res = await http.get(uri).timeout(const Duration(seconds: 10));

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
      final res = await http.get(uri).timeout(const Duration(seconds: 6));

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

  // 6. Flights
  Future<List<FlightTicket>> getFlights({String from = '', String to = '', String airline = ''}) async {
    try {
      final qParams = <String, String>{};
      if (from.isNotEmpty) qParams['from'] = from;
      if (to.isNotEmpty) qParams['to'] = to;
      if (airline.isNotEmpty) qParams['airline'] = airline;

      final uri = Uri.parse('$_baseUrl/api/flights/search').replace(queryParameters: qParams);
      final res = await http.get(uri).timeout(const Duration(seconds: 6));

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

  // 7. Hotels Only
  Future<List<HotelOnly>> getHotelsOnly({String country = '', String resort = '', String query = ''}) async {
    try {
      final qParams = <String, String>{};
      if (country.isNotEmpty) qParams['country'] = country;
      if (resort.isNotEmpty) qParams['resort'] = resort;
      if (query.isNotEmpty) qParams['q'] = query;

      final uri = Uri.parse('$_baseUrl/api/hotels/search').replace(queryParameters: qParams);
      final res = await http.get(uri).timeout(const Duration(seconds: 6));

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
  Future<List<Booking>> getBookings() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/db/bookings');
      final res = await http.get(uri).timeout(const Duration(seconds: 6));

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
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
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

  // 9. Price Alerts (DB)
  Future<List<PriceAlert>> getPriceAlerts() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/db/price-alerts');
      final res = await http.get(uri).timeout(const Duration(seconds: 6));

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
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
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
      final res = await http.get(uri, headers: {
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
