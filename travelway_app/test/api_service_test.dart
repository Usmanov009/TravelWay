import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:travelway_app/models/booking.dart';
import 'package:travelway_app/models/price_alert.dart';
import 'package:travelway_app/services/api_service.dart';

Booking _sampleBooking() => Booking(
  id: 'BK-TEST-1',
  tourTitle: 'Rixos Premium Belek 5★',
  dest: 'Antalya, Turkiya',
  dates: '12.11.2026',
  voucherId: 'VCH-TR-1',
  price: '\$2400 (2 kishi: 2 katta)',
  totalNumeric: 2400,
  travelerName: 'Jasur Rahimov',
  hotelImg: 'https://example.com/hotel.jpg',
  passport: 'AA1234567',
  phone: '+998901234567',
);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('ApiService — DB integratsiyasi (JWT)', () {
    test('createBooking Authorization: Bearer yuboradi', () async {
      final requests = <http.Request>[];
      final client = MockClient((request) async {
        requests.add(request);
        return http.Response(
          jsonEncode({'success': true}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final api = ApiService(client: client);
      await api.setAuthToken('test.jwt.token');

      final ok = await api.createBooking(_sampleBooking());

      expect(ok, isTrue);
      expect(requests, hasLength(1));
      expect(requests.single.method, 'POST');
      expect(requests.single.url.path, '/api/db/bookings');
      expect(requests.single.headers['Authorization'], 'Bearer test.jwt.token');

      final body = jsonDecode(requests.single.body) as Map<String, dynamic>;
      expect(body['travelerPassport'], 'AA1234567');
      expect(body['travelerPhone'], '+998901234567');
      expect(body['totalNumeric'], 2400);
    });

    test('token bo‘lmasa Authorization header yuborilmaydi', () async {
      final requests = <http.Request>[];
      final client = MockClient((request) async {
        requests.add(request);
        return http.Response(jsonEncode({'success': false}), 401);
      });

      final api = ApiService(client: client);
      final ok = await api.createBooking(_sampleBooking());

      expect(ok, isFalse);
      expect(requests.single.headers.containsKey('Authorization'), isFalse);
    });

    test('cancelBooking token bilan PUT yuboradi', () async {
      final requests = <http.Request>[];
      final client = MockClient((request) async {
        requests.add(request);
        return http.Response(jsonEncode({'success': true}), 200);
      });

      final api = ApiService(client: client);
      await api.setAuthToken('jwt-123');
      final ok = await api.cancelBooking('BK-TEST-1', reason: 'Reja o‘zgardi');

      expect(ok, isTrue);
      expect(requests.single.method, 'PUT');
      expect(requests.single.headers['Authorization'], 'Bearer jwt-123');
      final body = jsonDecode(requests.single.body) as Map<String, dynamic>;
      expect(body['status'], 'Bekor qilingan');
      expect(body['cancellationReason'], 'Reja o‘zgardi');
    });

    test('getBookings token bilan GET yuboradi va backend maydonlarini o‘qiydi',
        () async {
      final requests = <http.Request>[];
      final client = MockClient((request) async {
        requests.add(request);
        return http.Response(
          jsonEncode({
            'success': true,
            'bookings': [
              {
                'id': 'BK-DB-1',
                'tourTitle': 'Phuket Katathani',
                'travelerPassport': 'AB7654321',
                'travelerPhone': '+998977777777',
                'totalNumeric': 2100,
              },
            ],
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final api = ApiService(client: client);
      await api.setAuthToken('jwt-db');
      final bookings = await api.getBookings();

      expect(bookings, hasLength(1));
      expect(bookings.single.passport, 'AB7654321');
      expect(bookings.single.phone, '+998977777777');
      expect(requests.single.headers['Authorization'], 'Bearer jwt-db');
    });

    test('verifyTelegramCode JWT va userni qaytaradi hamda tokenni saqlaydi',
        () async {
      final client = MockClient((request) async {
        expect(request.url.path, '/api/auth/telegram/verify-code');
        return http.Response(
          jsonEncode({
            'success': true,
            'token': 'issued.jwt.token',
            'user': {
              'name': 'Jasur Rahimov',
              'phone': '+998901234567',
              'tcId': 'tw-777',
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final api = ApiService(client: client);
      final result =
          await api.verifyTelegramCode(code: '8492', sessionToken: 'reg_x');

      expect(result.success, isTrue);
      expect(result.user?['name'], 'Jasur Rahimov');
      expect(api.isAuthenticated, isTrue);
      expect(api.authToken, 'issued.jwt.token');
    });

    test('verifyTelegramCode muvaffaqiyatsizlikda xatoni qaytaradi', () async {
      final client = MockClient((request) async {
        return http.Response(
          jsonEncode({'success': false, 'error': 'Tasdiqlash kodi noto‘g‘ri'}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final api = ApiService(client: client);
      final result =
          await api.verifyTelegramCode(code: '0000', sessionToken: 'reg_y');

      expect(result.success, isFalse);
      expect(result.error, contains('noto‘g‘ri'));
      expect(api.isAuthenticated, isFalse);
    });

    test('saveUserProfile autentifikatsiyasiz so‘rov yubormaydi', () async {
      var called = false;
      final client = MockClient((request) async {
        called = true;
        return http.Response(jsonEncode({'success': true}), 200);
      });

      final api = ApiService(client: client);
      final saved = await api.saveUserProfile({'tcId': 'tw-1', 'name': 'Test'});

      expect(saved, isFalse);
      expect(called, isFalse);
    });

    test('saveUserProfile token bilan POST yuboradi', () async {
      final requests = <http.Request>[];
      final client = MockClient((request) async {
        requests.add(request);
        return http.Response(jsonEncode({'success': true}), 200);
      });

      final api = ApiService(client: client);
      await api.setAuthToken('jwt-profile');
      final saved = await api.saveUserProfile({
        'tcId': 'tw-777',
        'name': 'Jasur Rahimov',
        'phone': '+998901234567',
      });

      expect(saved, isTrue);
      expect(requests.single.url.path, '/api/db/users');
      expect(requests.single.headers['Authorization'], 'Bearer jwt-profile');
    });
  });

  group('Modellar — backend sxemasiga mosligi', () {
    test('PriceAlert.toJson tourId/tourTitle ni yuboradi', () {
      final json = PriceAlert(
        id: 'alert-1',
        destination: 'Rixos (Antalya)',
        targetPrice: 900,
        currentPrice: 1200,
        phone: '+998901234567',
        createdAt: '2026-11-05T00:00:00.000Z',
        tourId: 'tour-42',
        tourImg: 'https://example.com/a.jpg',
        tourLocation: 'Antalya',
      ).toJson();

      expect(json['tourId'], 'tour-42');
      expect(json['tourTitle'], 'Rixos (Antalya)');
      expect(json['targetPrice'], 900);
    });

    test('Booking.toJson backend maydonlarini o‘z ichiga oladi', () {
      final json = _sampleBooking().toJson();

      expect(json['travelerPassport'], 'AA1234567');
      expect(json['travelerPhone'], '+998901234567');
      expect(json['totalNumeric'], 2400);
    });

    test('Booking.fromJson backend maydonlarini o‘qiydi', () {
      final booking = Booking.fromJson({
        'id': 'BK-9',
        'tourTitle': 'Bali Ayana',
        'travelerPassport': 'AC1112223',
        'travelerPhone': '+998955555555',
        'totalNumeric': 3900,
      });

      expect(booking.passport, 'AC1112223');
      expect(booking.phone, '+998955555555');
      expect(booking.totalNumeric, 3900);
    });
  });
}
