import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/payment_card.dart';
import '../utils/app_theme.dart';

class PaymentCardsSheet extends StatefulWidget {
  const PaymentCardsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const PaymentCardsSheet(),
    );
  }

  @override
  State<PaymentCardsSheet> createState() => _PaymentCardsSheetState();
}

class _PaymentCardsSheetState extends State<PaymentCardsSheet> {
  static const String _storageKey = 'sayrhub_user_payment_cards';
  List<PaymentCard> _cards = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCards();
  }

  Future<void> _loadCards() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_storageKey);
      if (saved != null && saved.isNotEmpty) {
        _cards = PaymentCard.decodeList(saved);
      } else {
        _cards = [];
      }
    } catch (_) {
      _cards = [];
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveCards() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, PaymentCard.encodeList(_cards));
    } catch (_) {}
  }

  void _setPrimaryCard(String id) {
    setState(() {
      for (final c in _cards) {
        c.isPrimary = (c.id == id);
      }
    });
    _saveCards();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Asosiy to\'lov kartasi belgilandi'), duration: Duration(seconds: 1)),
    );
  }

  void _deleteCard(String id) {
    setState(() {
      _cards.removeWhere((c) => c.id == id);
      if (_cards.isNotEmpty && !_cards.any((c) => c.isPrimary)) {
        _cards.first.isPrimary = true;
      }
    });
    _saveCards();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Karta o\'chirildi'), duration: Duration(seconds: 1)),
    );
  }

  void _openAddCardDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AddCardSheet(
        onAdd: (newCard) {
          setState(() {
            if (_cards.isEmpty) {
              newCard.isPrimary = true;
            }
            _cards.insert(0, newCard);
          });
          _saveCards();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Yangi karta muvaffaqiyatli saqlandi! 🎉'), duration: Duration(seconds: 2)),
          );
        },
      ),
    );
  }

  LinearGradient _getCardGradient(String type) {
    switch (type) {
      case 'HUMO':
        return const LinearGradient(
          colors: [Color(0xFF0F766E), Color(0xFF042F2E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'VISA':
        return const LinearGradient(
          colors: [Color(0xFF1D4ED8), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'MASTERCARD':
        return const LinearGradient(
          colors: [Color(0xFFB91C1C), Color(0xFF450A0A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'UZCARD':
      default:
        return const LinearGradient(
          colors: [Color(0xFF4338CA), Color(0xFF1E1B4B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.borderDark,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 12, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.credit_card, color: AppTheme.primary, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'To\'lov Kartalari',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                        ),
                        Text(
                          '${_cards.length} ta karta ulangan',
                          style: const TextStyle(fontSize: 11, color: AppTheme.textSub),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppTheme.textSub),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.borderDark),

          // Cards List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _cards.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: AppTheme.subtleDark,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.credit_card_off_outlined, size: 48, color: AppTheme.textMuted),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Hozircha karta ulanmagan',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textMain),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Turlarni tez va xavfsiz band qilish uchun Uzcard, Humo yoki Visa kartangizni qo\'shing.',
                                style: TextStyle(fontSize: 12, color: AppTheme.textSub),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 20),
                              ElevatedButton.icon(
                                onPressed: _openAddCardDialog,
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Karta qo\'shish'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _cards.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (context, idx) {
                          final card = _cards[idx];
                          final gradient = _getCardGradient(card.type);

                          return Container(
                            decoration: BoxDecoration(
                              gradient: gradient,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: card.isPrimary ? AppTheme.accentGold : Colors.white12,
                                width: card.isPrimary ? 1.5 : 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.35),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      card.bank,
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.black38,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        card.type,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w900,
                                          fontSize: 11,
                                          letterSpacing: 1,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 18),

                                // Card Chip Icon
                                Row(
                                  children: [
                                    Container(
                                      width: 32,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: Colors.amber.withOpacity(0.8),
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                      child: const Center(
                                        child: Icon(Icons.memory, size: 18, color: Colors.black87),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.wifi, size: 16, color: Colors.white54),
                                  ],
                                ),
                                const SizedBox(height: 14),

                                // Masked Card Number
                                Text(
                                  card.maskedNumber,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 3,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(height: 14),

                                // Expiry and Actions
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('AMAL QILISH', style: TextStyle(color: Colors.white38, fontSize: 8)),
                                        Text(card.expiry, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('EGASI', style: TextStyle(color: Colors.white38, fontSize: 8)),
                                        Text(card.holderName.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    Row(
                                      children: [
                                        if (!card.isPrimary)
                                          GestureDetector(
                                            onTap: () => _setPrimaryCard(card.id),
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: Colors.white24,
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: const Text(
                                                'Asosiy qilish',
                                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                              ),
                                            ),
                                          )
                                        else
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: AppTheme.accentGold.withOpacity(0.25),
                                              borderRadius: BorderRadius.circular(8),
                                              border: Border.all(color: AppTheme.accentGold),
                                            ),
                                            child: const Row(
                                              children: [
                                                Icon(Icons.check_circle, size: 12, color: AppTheme.accentGold),
                                                SizedBox(width: 4),
                                                Text(
                                                  'Asosiy',
                                                  style: TextStyle(color: AppTheme.accentGold, fontSize: 10, fontWeight: FontWeight.bold),
                                                ),
                                              ],
                                            ),
                                          ),
                                        const SizedBox(width: 8),
                                        GestureDetector(
                                          onTap: () => _deleteCard(card.id),
                                          child: Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              color: Colors.redAccent.withOpacity(0.2),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                                          ),
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
          ),

          // Add Card Button
          if (_cards.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _openAddCardDialog,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Yangi to\'lov kartasi qo\'shish'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _AddCardSheet extends StatefulWidget {
  final ValueChanged<PaymentCard> onAdd;

  const _AddCardSheet({required this.onAdd});

  @override
  State<_AddCardSheet> createState() => _AddCardSheetState();
}

class _AddCardSheetState extends State<_AddCardSheet> {
  final TextEditingController _numberController = TextEditingController();
  final TextEditingController _expiryController = TextEditingController();
  final TextEditingController _holderController = TextEditingController(text: 'ALISHER YUSUPOV');

  String _detectedType = 'UZCARD';
  String _detectedBank = 'Uzcard Milliy';

  @override
  void initState() {
    super.initState();
    _numberController.addListener(_onNumberChanged);
  }

  void _onNumberChanged() {
    final raw = _numberController.text.replaceAll(RegExp(r'\D'), '');
    setState(() {
      _detectedType = PaymentCard.detectType(raw);
      _detectedBank = PaymentCard.detectBank(raw);
    });
  }

  @override
  void dispose() {
    _numberController.dispose();
    _expiryController.dispose();
    _holderController.dispose();
    super.dispose();
  }

  void _handleSave() {
    final rawNumber = _numberController.text.replaceAll(RegExp(r'\D'), '');
    if (rawNumber.length != 16) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Karta raqami 16 xonali bo\'lishi shart')),
      );
      return;
    }

    final expiry = _expiryController.text.trim();
    if (expiry.length != 5 || !expiry.contains('/')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Amal qilish muddatini MM/YY shaklida kiriting')),
      );
      return;
    }

    final holder = _holderController.text.trim().isEmpty ? 'SAYRHUB FOYDALANUVCHISI' : _holderController.text.trim();

    final newCard = PaymentCard(
      id: 'card_${DateTime.now().millisecondsSinceEpoch}',
      cardNumber: rawNumber,
      holderName: holder,
      expiry: expiry,
      type: _detectedType,
      bank: _detectedBank,
      isPrimary: false,
    );

    widget.onAdd(newCard);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Yangi Karta Qo\'shish',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppTheme.textSub),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Card Number Input
            const Text('Karta raqami (16 xonali)', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
            const SizedBox(height: 6),
            TextField(
              controller: _numberController,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(16),
                _CardNumberInputFormatter(),
              ],
              style: const TextStyle(fontSize: 14, color: AppTheme.textMain, letterSpacing: 1.5, fontFamily: 'monospace'),
              decoration: InputDecoration(
                hintText: '8600 0000 0000 0000',
                hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                filled: true,
                fillColor: AppTheme.subtleDark,
                prefixIcon: const Icon(Icons.credit_card, size: 18, color: AppTheme.primary),
                suffixIcon: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.cardDark,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _detectedType,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentSky),
                    ),
                  ),
                ),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                // Expiry
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Amal qilish muddati', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _expiryController,
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(4),
                          _ExpiryDateInputFormatter(),
                        ],
                        style: const TextStyle(fontSize: 14, color: AppTheme.textMain),
                        decoration: InputDecoration(
                          hintText: 'MM/YY (masalan: 08/28)',
                          hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          filled: true,
                          fillColor: AppTheme.subtleDark,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),

                // Cardholder
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Karta egasi', style: TextStyle(fontSize: 12, color: AppTheme.textSub)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _holderController,
                        textCapitalization: TextCapitalization.characters,
                        style: const TextStyle(fontSize: 13, color: AppTheme.textMain),
                        decoration: InputDecoration(
                          hintText: 'ISM FAMILIYA',
                          hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          filled: true,
                          fillColor: AppTheme.subtleDark,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Kartani saqlash', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CardNumberInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final text = newValue.text.replaceAll(' ', '');
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(text[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class _ExpiryDateInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final text = newValue.text.replaceAll('/', '');
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i == 2) buffer.write('/');
      buffer.write(text[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
