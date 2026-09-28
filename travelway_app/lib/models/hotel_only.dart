class HotelOnly {
  final String id;
  final String name;
  final String stars;
  final String country;
  final String resort;
  final String mealType;
  final String mealDesc;
  final int pricePerNight;
  final int total7Nights;
  final String img;
  final double rating;
  final String roomType;

  HotelOnly({
    required this.id,
    required this.name,
    required this.stars,
    required this.country,
    required this.resort,
    required this.mealType,
    required this.mealDesc,
    required this.pricePerNight,
    required this.total7Nights,
    required this.img,
    required this.rating,
    required this.roomType,
  });

  factory HotelOnly.fromJson(Map<String, dynamic> json) {
    return HotelOnly(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      stars: json['stars']?.toString() ?? '5★',
      country: json['country']?.toString() ?? '',
      resort: json['resort']?.toString() ?? '',
      mealType: json['mealType']?.toString() ?? 'AI',
      mealDesc: json['mealDesc']?.toString() ?? 'All Inclusive',
      pricePerNight: (json['pricePerNight'] is num) ? (json['pricePerNight'] as num).toInt() : 0,
      total7Nights: (json['total7Nights'] is num) ? (json['total7Nights'] as num).toInt() : 0,
      img: json['img']?.toString() ?? '',
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 9.0,
      roomType: json['roomType']?.toString() ?? 'Standard Room',
    );
  }
}
