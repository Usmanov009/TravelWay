import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/tour_package.dart';
import '../models/price_alert.dart';
import '../providers/app_provider.dart';
import '../utils/app_theme.dart';

class PriceAlertDialog extends StatefulWidget {
  final TourPackage tour;

  const PriceAlertDialog({super.key, required this.tour});

  @override
  State<PriceAlertDialog> createState() => _PriceAlertDialogState();
}

class _PriceAlertDialogState extends State<PriceAlertDialog> {
  late final TextEditingController _targetPriceController;
  final _phoneController = TextEditingController(text: '+998 90 123 45 67');
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final suggested = (widget.tour.price * 0.85).round();
    _targetPriceController = TextEditingController(text: suggested.toString());
  }

  @override
  void dispose() {
    _targetPriceController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submitAlert() async {
    final target = int.tryParse(_targetPriceController.text.trim()) ?? 0;
    if (target <= 0 || _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Iltimos, maqsadli narx va telefon raqamingizni to\'g\'ri kiriting')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final provider = Provider.of<AppProvider>(context, listen: false);
    final alert = PriceAlert(
      id: 'alert-${DateTime.now().millisecondsSinceEpoch}',
      destination: '${widget.tour.title} (${widget.tour.location})',
      targetPrice: target,
      currentPrice: widget.tour.price,
      phone: _phoneController.text.trim(),
      createdAt: DateTime.now().toIso8601String(),
    );

    await provider.createPriceAlert(alert);

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.surfaceDark,
          content: Row(
            children: [
              const Icon(Icons.notifications_active, color: AppTheme.accentGold, size: 20),
              const SizedBox(width: 10),
              Expanded(child: Text('Narx \$$target ga tushganda SMS/Telegram xabar beramiz!')),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.surfaceDark,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.notifications_active_outlined, color: AppTheme.accentGold, size: 22),
                    SizedBox(width: 8),
                    Text('Narx tushishini kuzatish', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '${widget.tour.title} mehmonxonasi uchun hozirgi narx: \$${widget.tour.price}. Agar narx siz belgilagan miqdorga tushsa, darhol xabardor qilamiz.',
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _targetPriceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Kutilayotgan narx (\$ USD)',
                prefixText: '\$ ',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Xabardor qilish uchun telefon',
                prefixIcon: Icon(Icons.phone_outlined, size: 18),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentGold),
                onPressed: _isSubmitting ? null : _submitAlert,
                child: _isSubmitting
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Signalni faollashtirish 🔔', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
