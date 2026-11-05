class PriceAlert {
  final String id;
  final String destination;
  final int targetPrice;
  final int currentPrice;
  final String phone;
  final String status;
  final String createdAt;
  final String tourId;
  final String tourImg;
  final String tourLocation;

  PriceAlert({
    required this.id,
    required this.destination,
    required this.targetPrice,
    required this.currentPrice,
    required this.phone,
    this.status = 'active',
    required this.createdAt,
    this.tourId = '',
    this.tourImg = '',
    this.tourLocation = '',
  });

  factory PriceAlert.fromJson(Map<String, dynamic> json) {
    return PriceAlert(
      id: json['id']?.toString() ?? '',
      destination: json['destination']?.toString() ?? json['tourTitle']?.toString() ?? 'Turkiya',
      targetPrice: (json['targetPrice'] is num) ? (json['targetPrice'] as num).toInt() : 0,
      currentPrice: (json['currentPrice'] is num) ? (json['currentPrice'] as num).toInt() : 0,
      phone: json['phone']?.toString() ?? '',
      status: json['status']?.toString() ?? 'active',
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toString(),
      tourId: json['tourId']?.toString() ?? '',
      tourImg: json['tourImg']?.toString() ?? '',
      tourLocation: json['tourLocation']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      // Server `tourId`ni majburiy tekshiradi
      'tourId': tourId.isNotEmpty ? tourId : 'alert-$id',
      'tourTitle': destination,
      'tourLocation': tourLocation.isNotEmpty ? tourLocation : destination,
      'tourImg': tourImg,
      'currentPrice': currentPrice,
      'targetPrice': targetPrice,
      'createdAt': createdAt,
      'status': status,
      'destination': destination,
      'phone': phone,
    };
  }
}
