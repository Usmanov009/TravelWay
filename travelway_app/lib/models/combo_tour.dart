class ComboTour {
  final String id;
  final String title;
  final String route;
  final List<String> cities;
  final int durationDays;
  final int nights;
  final int price;
  final int oldPrice;
  final String img;
  final List<String> highlights;
  final List<String> includedServices;
  final String departureCity;

  ComboTour({
    required this.id,
    required this.title,
    required this.route,
    required this.cities,
    required this.durationDays,
    required this.nights,
    required this.price,
    required this.oldPrice,
    required this.img,
    required this.highlights,
    required this.includedServices,
    required this.departureCity,
  });

  factory ComboTour.fromJson(Map<String, dynamic> json) {
    return ComboTour(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      route: json['route']?.toString() ?? '',
      cities: (json['cities'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      durationDays: (json['durationDays'] is num) ? (json['durationDays'] as num).toInt() : 8,
      nights: (json['nights'] is num) ? (json['nights'] as num).toInt() : 7,
      price: (json['price'] is num) ? (json['price'] as num).toInt() : 0,
      oldPrice: (json['oldPrice'] is num) ? (json['oldPrice'] as num).toInt() : 0,
      img: json['img']?.toString() ?? '',
      highlights: (json['highlights'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      includedServices: (json['includedServices'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      departureCity: json['departureCity']?.toString() ?? 'Toshkent (TAS)',
    );
  }
}
