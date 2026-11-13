import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const _loggedInKey = 'sayrhub_is_logged_in';
  static const _nameKey = 'sayrhub_user_name';
  static const _phoneKey = 'sayrhub_user_phone';
  static const _passportKey = 'sayrhub_user_passport';
  static const _idKey = 'sayrhub_user_id';

  static Future<bool> isLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_loggedInKey) ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<Map<String, String?>> getUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return {
        'name': prefs.getString(_nameKey),
        'phone': prefs.getString(_phoneKey),
        'passport': prefs.getString(_passportKey),
        'id': prefs.getString(_idKey),
      };
    } catch (_) {
      return {'name': null, 'phone': null, 'passport': null, 'id': null};
    }
  }

  static Future<void> setLoggedIn(bool value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_loggedInKey, value);
    } catch (_) {}
  }

  static Future<void> saveUserData({
    required String name,
    required String phone,
    required String passport,
    required String id,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_loggedInKey, true);
      await prefs.setString(_nameKey, name);
      await prefs.setString(_phoneKey, phone);
      await prefs.setString(_passportKey, passport);
      await prefs.setString(_idKey, id);
    } catch (_) {}
  }

  static Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_loggedInKey, false);
    } catch (_) {}
  }
}