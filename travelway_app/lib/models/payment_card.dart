import 'dart:convert';

class PaymentCard {
  final String id;
  final String cardNumber;
  final String holderName;
  final String expiry;
  final String type; // 'UZCARD', 'HUMO', 'VISA', 'MASTERCARD'
  final String bank;
  bool isPrimary;

  PaymentCard({
    required this.id,
    required this.cardNumber,
    required this.holderName,
    required this.expiry,
    required this.type,
    required this.bank,
    this.isPrimary = false,
  });

  String get last4 {
    final clean = cardNumber.replaceAll(RegExp(r'\s+'), '');
    return clean.length >= 4 ? clean.substring(clean.length - 4) : clean;
  }

  String get maskedNumber => '•••• •••• •••• $last4';

  static String detectType(String number) {
    final clean = number.replaceAll(RegExp(r'\D'), '');
    if (clean.startsWith('8600')) return 'UZCARD';
    if (clean.startsWith('9860')) return 'HUMO';
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'MASTERCARD';
    return 'UZCARD';
  }

  static String detectBank(String number) {
    final clean = number.replaceAll(RegExp(r'\D'), '');
    if (clean.startsWith('8600')) return 'Uzcard Milliy';
    if (clean.startsWith('9860')) return 'Humo To\'lov';
    if (clean.startsWith('4')) return 'Visa International';
    if (clean.startsWith('5')) return 'Mastercard Global';
    return 'Bank Kartasi';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cardNumber': cardNumber,
      'holderName': holderName,
      'expiry': expiry,
      'type': type,
      'bank': bank,
      'isPrimary': isPrimary,
    };
  }

  factory PaymentCard.fromJson(Map<String, dynamic> json) {
    return PaymentCard(
      id: json['id']?.toString() ?? '',
      cardNumber: json['cardNumber']?.toString() ?? '',
      holderName: json['holderName']?.toString() ?? '',
      expiry: json['expiry']?.toString() ?? '',
      type: json['type']?.toString() ?? 'UZCARD',
      bank: json['bank']?.toString() ?? 'Bank',
      isPrimary: json['isPrimary'] == true,
    );
  }

  static String encodeList(List<PaymentCard> cards) {
    return jsonEncode(cards.map((c) => c.toJson()).toList());
  }

  static List<PaymentCard> decodeList(String raw) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded.map((c) => PaymentCard.fromJson(c as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }
}
