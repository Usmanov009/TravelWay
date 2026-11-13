import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CartService {
  static const _favoritesKey = 'sayrhub_favorite_tour_ids';
  static const _cartKey = 'sayrhub_cart_items';

  // Favorites (tour package IDs)
  static Future<Set<String>> getFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_favoritesKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> list = jsonDecode(jsonStr);
        return list.map((e) => e.toString()).toSet();
      }
    } catch (_) {}
    return <String>{};
  }

  static Future<void> saveFavorites(Set<String> favorites) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_favoritesKey, jsonEncode(favorites.toList()));
    } catch (_) {}
  }

  static Future<void> addFavorite(String tourId) async {
    final favorites = await getFavorites();
    favorites.add(tourId);
    await saveFavorites(favorites);
  }

  static Future<void> removeFavorite(String tourId) async {
    final favorites = await getFavorites();
    favorites.remove(tourId);
    await saveFavorites(favorites);
  }

  static Future<void> toggleFavorite(String tourId) async {
    final favorites = await getFavorites();
    if (favorites.contains(tourId)) {
      favorites.remove(tourId);
    } else {
      favorites.add(tourId);
    }
    await saveFavorites(favorites);
  }

  static Future<bool> isFavorite(String tourId) async {
    final favorites = await getFavorites();
    return favorites.contains(tourId);
  }

  // Cart items (tour package IDs with quantities)
  static Future<Map<String, int>> getCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_cartKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final Map<String, dynamic> map = jsonDecode(jsonStr);
        return map.map((k, v) => MapEntry(k, v as int));
      }
    } catch (_) {}
    return <String, int>{};
  }

  static Future<void> saveCart(Map<String, int> cart) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cartKey, jsonEncode(cart));
    } catch (_) {}
  }

  static Future<void> addToCart(String tourId, {int quantity = 1}) async {
    final cart = await getCart();
    cart[tourId] = (cart[tourId] ?? 0) + quantity;
    await saveCart(cart);
  }

  static Future<void> removeFromCart(String tourId) async {
    final cart = await getCart();
    cart.remove(tourId);
    await saveCart(cart);
  }

  static Future<void> updateCartQuantity(String tourId, int quantity) async {
    final cart = await getCart();
    if (quantity <= 0) {
      cart.remove(tourId);
    } else {
      cart[tourId] = quantity;
    }
    await saveCart(cart);
  }

  static Future<void> clearCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cartKey);
    } catch (_) {}
  }

  static Future<int> getCartCount() async {
    final cart = await getCart();
    return cart.values.fold<int>(0, (int a, int b) => a + b);
  }
}