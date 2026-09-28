class TourPackage {
  final String id;
  final String title;
  final String location;
  final String tag;
  final String badgeType;
  final bool is5Star;
  final double rating;
  final String nights;
  final String flight;
  final int price;
  final int? oldPrice;
  final String img;
  final bool saved;
  final String category;
  final String departureCity;
  final String country;
  final String resort;
  final String hotelStars;
  final String mealType;
  final String mealDesc;
  final String roomType;
  final String departureDate;
  final int nightsCount;
  final String airline;
  final String kompasTourCode;
  final String kompasOnlineUrl;
  final bool isLiveKompas;
  final double? lat;
  final double? lng;

  TourPackage({
    required this.id,
    required this.title,
    required this.location,
    required this.tag,
    this.badgeType = 'beach',
    this.is5Star = false,
    this.rating = 8.5,
    required this.nights,
    required this.flight,
    required this.price,
    this.oldPrice,
    required this.img,
    this.saved = false,
    this.category = 'beach',
    this.departureCity = 'Toshkent (TAS)',
    required this.country,
    required this.resort,
    this.hotelStars = '4★',
    this.mealType = 'AI',
    this.mealDesc = 'All Inclusive',
    this.roomType = 'Standard Room',
    this.departureDate = '',
    this.nightsCount = 7,
    this.airline = 'Uzbekistan Airways',
    this.kompasTourCode = '',
    this.kompasOnlineUrl = '',
    this.isLiveKompas = true,
    this.lat,
    this.lng,
  });

  factory TourPackage.fromJson(Map<String, dynamic> json) {
    return TourPackage(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Resort Hotel',
      location: json['location']?.toString() ?? '',
      tag: json['tag']?.toString() ?? (json['mealDesc']?.toString() ?? 'All Inclusive'),
      badgeType: json['badgeType']?.toString() ?? 'beach',
      is5Star: json['is5Star'] == true,
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 8.5,
      nights: json['nights']?.toString() ?? '7 kecha',
      flight: json['flight']?.toString() ?? 'Charter parvoz',
      price: (json['price'] is num) ? (json['price'] as num).toInt() : 0,
      oldPrice: (json['oldPrice'] is num) ? (json['oldPrice'] as num).toInt() : null,
      img: json['img']?.toString() ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      saved: json['saved'] == true,
      category: json['category']?.toString() ?? 'beach',
      departureCity: json['departureCity']?.toString() ?? 'Toshkent (TAS)',
      country: json['country']?.toString() ?? 'Turkiya',
      resort: json['resort']?.toString() ?? '',
      hotelStars: json['hotelStars']?.toString() ?? '4★',
      mealType: json['mealType']?.toString() ?? 'AI',
      mealDesc: json['mealDesc']?.toString() ?? '',
      roomType: json['roomType']?.toString() ?? 'Standard Room',
      departureDate: json['departureDate']?.toString() ?? '',
      nightsCount: (json['nightsCount'] is num) ? (json['nightsCount'] as num).toInt() : 7,
      airline: json['airline']?.toString() ?? 'Uzbekistan Airways',
      kompasTourCode: json['kompasTourCode']?.toString() ?? '',
      kompasOnlineUrl: json['kompasOnlineUrl']?.toString() ?? '',
      isLiveKompas: json['isLiveKompas'] == true,
      lat: (json['lat'] is num) ? (json['lat'] as num).toDouble() : null,
      lng: (json['lng'] is num) ? (json['lng'] as num).toDouble() : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'location': location,
      'tag': tag,
      'badgeType': badgeType,
      'is5Star': is5Star,
      'rating': rating,
      'nights': nights,
      'flight': flight,
      'price': price,
      'oldPrice': oldPrice,
      'img': img,
      'saved': saved,
      'category': category,
      'departureCity': departureCity,
      'country': country,
      'resort': resort,
      'hotelStars': hotelStars,
      'mealType': mealType,
      'mealDesc': mealDesc,
      'roomType': roomType,
      'departureDate': departureDate,
      'nightsCount': nightsCount,
      'airline': airline,
      'kompasTourCode': kompasTourCode,
      'kompasOnlineUrl': kompasOnlineUrl,
      'isLiveKompas': isLiveKompas,
      'lat': lat,
      'lng': lng,
    };
  }

  TourPackage copyWith({bool? saved}) {
    return TourPackage(
      id: id,
      title: title,
      location: location,
      tag: tag,
      badgeType: badgeType,
      is5Star: is5Star,
      rating: rating,
      nights: nights,
      flight: flight,
      price: price,
      oldPrice: oldPrice,
      img: img,
      saved: saved ?? this.saved,
      category: category,
      departureCity: departureCity,
      country: country,
      resort: resort,
      hotelStars: hotelStars,
      mealType: mealType,
      mealDesc: mealDesc,
      roomType: roomType,
      departureDate: departureDate,
      nightsCount: nightsCount,
      airline: airline,
      kompasTourCode: kompasTourCode,
      kompasOnlineUrl: kompasOnlineUrl,
      isLiveKompas: isLiveKompas,
      lat: lat,
      lng: lng,
    );
  }
}
