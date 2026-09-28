class FlightTicket {
  final String id;
  final String airline;
  final String airlineCode;
  final String flightNumber;
  final String departureCity;
  final String arrivalCity;
  final String departureAirportCode;
  final String arrivalAirportCode;
  final String departureDate;
  final String departureTime;
  final String arrivalTime;
  final String duration;
  final int price;
  final String flightType; // 'charter' | 'gds'
  final String baggage;
  final String airplane;
  final int availableSeats;

  FlightTicket({
    required this.id,
    required this.airline,
    required this.airlineCode,
    required this.flightNumber,
    required this.departureCity,
    required this.arrivalCity,
    required this.departureAirportCode,
    required this.arrivalAirportCode,
    required this.departureDate,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.price,
    this.flightType = 'charter',
    this.baggage = '20 kg',
    this.airplane = 'Airbus A321neo',
    this.availableSeats = 9,
  });

  factory FlightTicket.fromJson(Map<String, dynamic> json) {
    return FlightTicket(
      id: json['id']?.toString() ?? '',
      airline: json['airline']?.toString() ?? 'Uzbekistan Airways',
      airlineCode: json['airlineCode']?.toString() ?? 'HY',
      flightNumber: json['flightNumber']?.toString() ?? '',
      departureCity: json['departureCity']?.toString() ?? 'Toshkent',
      arrivalCity: json['arrivalCity']?.toString() ?? '',
      departureAirportCode: json['departureAirportCode']?.toString() ?? 'TAS',
      arrivalAirportCode: json['arrivalAirportCode']?.toString() ?? '',
      departureDate: json['departureDate']?.toString() ?? '',
      departureTime: json['departureTime']?.toString() ?? '',
      arrivalTime: json['arrivalTime']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toInt() : 0,
      flightType: json['flightType']?.toString() ?? 'charter',
      baggage: json['baggage']?.toString() ?? '20 kg',
      airplane: json['airplane']?.toString() ?? 'Airbus A320',
      availableSeats: (json['availableSeats'] is num) ? (json['availableSeats'] as num).toInt() : 6,
    );
  }
}
