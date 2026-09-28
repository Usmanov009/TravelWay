class Booking {
  final String id;
  final String tourTitle;
  final String dest;
  final String dates;
  final String status;
  final String voucherId;
  final String price;
  final int totalNumeric;
  final String travelerName;
  final String type; // 'active' | 'completed' | 'cancelled'
  final String startDate;
  final String endDate;
  final String hotelImg;
  final String flight;
  final String airline;
  final int nightsCount;
  final String passport;
  final String phone;

  Booking({
    required this.id,
    required this.tourTitle,
    required this.dest,
    required this.dates,
    this.status = 'Tasdiqlangan',
    required this.voucherId,
    required this.price,
    required this.totalNumeric,
    required this.travelerName,
    this.type = 'active',
    this.startDate = '',
    this.endDate = '',
    required this.hotelImg,
    this.flight = 'Charter parvoz',
    this.airline = 'Uzbekistan Airways',
    this.nightsCount = 7,
    this.passport = '',
    this.phone = '',
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? '',
      tourTitle: json['tourTitle']?.toString() ?? 'Turpaket',
      dest: json['dest']?.toString() ?? '',
      dates: json['dates']?.toString() ?? '',
      status: json['status']?.toString() ?? 'Tasdiqlangan',
      voucherId: json['voucherId']?.toString() ?? 'VCH-${DateTime.now().millisecondsSinceEpoch % 100000}',
      price: json['price']?.toString() ?? '\$0',
      totalNumeric: (json['totalNumeric'] is num) ? (json['totalNumeric'] as num).toInt() : 0,
      travelerName: json['travelerName']?.toString() ?? 'Mijoz',
      type: json['type']?.toString() ?? 'active',
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      hotelImg: json['hotelImg']?.toString() ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      flight: json['flight']?.toString() ?? 'Uzbekistan Airways',
      airline: json['airline']?.toString() ?? 'Uzbekistan Airways',
      nightsCount: (json['nightsCount'] is num) ? (json['nightsCount'] as num).toInt() : 7,
      passport: json['passport']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tourTitle': tourTitle,
      'dest': dest,
      'dates': dates,
      'status': status,
      'voucherId': voucherId,
      'price': price,
      'totalNumeric': totalNumeric,
      'travelerName': travelerName,
      'type': type,
      'startDate': startDate,
      'endDate': endDate,
      'hotelImg': hotelImg,
      'flight': flight,
      'airline': airline,
      'nightsCount': nightsCount,
      'passport': passport,
      'phone': phone,
    };
  }
}
