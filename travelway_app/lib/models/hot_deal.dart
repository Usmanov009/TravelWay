class HotDeal {
  final String id;
  final String title;
  final String discount;
  final String oldPrice;
  final String price;
  final int priceNumeric;
  final String timeLeft;
  final String flight;
  final String freeSeats;
  final String img;
  final String location;
  final String checkinDate;
  final String nights;
  final String kompasOnlineUrl;
  final String liveSource;

  HotDeal({
    required this.id,
    required this.title,
    required this.discount,
    required this.oldPrice,
    required this.price,
    required this.priceNumeric,
    required this.timeLeft,
    required this.flight,
    required this.freeSeats,
    required this.img,
    required this.location,
    required this.checkinDate,
    required this.nights,
    required this.kompasOnlineUrl,
    this.liveSource = 'online.uz.kompastour.com',
  });

  factory HotDeal.fromJson(Map<String, dynamic> json) {
    return HotDeal(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      discount: json['discount']?.toString() ?? '-30%',
      oldPrice: json['oldPrice']?.toString() ?? '',
      price: json['price']?.toString() ?? '',
      priceNumeric: (json['priceNumeric'] is num)
          ? (json['priceNumeric'] as num).toInt()
          : int.tryParse(json['price']?.toString().replaceAll(RegExp(r'[^0-9]'), '') ?? '0') ?? 0,
      timeLeft: json['timeLeft']?.toString() ?? 'Bugun so\'nggi kun',
      flight: json['flight']?.toString() ?? 'To\'g\'ridan-to\'g\'ri charter',
      freeSeats: json['freeSeats']?.toString() ?? 'Joylar cheklangan',
      img: json['img']?.toString() ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      location: json['location']?.toString() ?? '',
      checkinDate: json['checkinDate']?.toString() ?? '',
      nights: json['nights']?.toString() ?? '7 kecha',
      kompasOnlineUrl: json['kompasOnlineUrl']?.toString() ?? '',
      liveSource: json['liveSource']?.toString() ?? 'online.uz.kompastour.com',
    );
  }
}
