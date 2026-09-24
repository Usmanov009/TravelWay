export type TabType = 'search' | 'explore' | 'hot' | 'trips' | 'profile' | 'auth';

export type SearchServiceMode = 'tours' | 'combo' | 'flights' | 'hotels';

export type LanguageCode = 'UZ' | 'RU' | 'EN';

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface TourPackage {
  id: string;
  title: string;
  location: string;
  tag: string;
  badgeType: 'ultra' | 'luxury' | 'cheap' | 'culture' | 'beach';
  is5Star: boolean;
  rating: number;
  nights: string;
  flight: string;
  price: number;
  oldPrice?: number;
  img: string;
  saved: boolean;
  category: string;
  // Kompas Tour fields (online.uz.kompastour.com)
  departureCity?: string; // Toshkent (TAS), Samarqand (SKD), etc.
  country?: string; // Turkiya, BAA, Misr, Tailand, Vetnam, Maldiv, Xitoy, etc.
  resort?: string; // Antalya, Belek, Kemer, Alanya, Sharm El-Sheikh, Dubay, Phuket, etc.
  hotelStars?: string; // '5★ Deluxe' | '5★' | '4★+' | '4★' | '3★'
  mealType?: 'UAI' | 'AI' | 'FB' | 'HB' | 'BB' | 'RO';
  mealDesc?: string;
  roomType?: string;
  departureDate?: string;
  nightsCount?: number;
  flightNumber?: string;
  airline?: string;
  baggage?: string;
  seatsStatus?: 'available' | 'guaranteed' | 'request';
  kompasTourCode?: string;
  kompasOnlineUrl?: string;
  isLiveKompas?: boolean;
  inclusions?: string[];
  lat?: number;
  lng?: number;
}

export interface Booking {
  id: string;
  tourTitle: string;
  dest: string;
  dates: string;
  status: 'Tasdiqlangan' | 'Vaucher tayyor' | 'Jarayonda';
  voucherId: string;
  price: string;
  totalNumeric: number;
  travelerName: string;
  type: 'active' | 'completed' | 'cancelled';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  hotelImg?: string;
  flight?: string;
  airline?: string;
  nightsCount?: number;
}

export interface ExploreVibe {
  id: string;
  vibe: 'beach' | 'culture' | 'mountain' | 'luxury';
  title: string;
  badge: string;
  count: string;
  priceFrom: string;
  img: string;
  destQuery: string;
}

export interface HotSale {
  id: string;
  title: string;
  discount: string;
  oldPrice: string;
  price: string;
  priceNumeric: number;
  timeLeft: string;
  flight: string;
  freeSeats: string;
  img: string;
  location: string;
  checkinDate?: string;
  nights?: string;
  kompasOnlineUrl?: string;
  liveSource?: string;
}

export interface PaymentCard {
  id: string;
  type: 'HUMO' | 'UZCARD' | 'VISA';
  last4: string;
  bank: string;
  isPrimary: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  tcId: string;
  cashback: number;
  passportNumber: string;
  passportExpiry: string;
  dob: string;
  isVerified: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface PriceAlert {
  id: string;
  tourId: string;
  tourTitle: string;
  tourLocation: string;
  tourImg: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  status: 'active' | 'triggered';
  notifyViaPush: boolean;
  notifyViaTelegram: boolean;
  userEmail?: string;
}

export interface ComboHotelStop {
  city: string;
  hotelName: string;
  stars: string;
  nights: number;
  meal: string;
  img?: string;
}

export interface ComboTour {
  id: string;
  title: string;
  route: string[];
  routeSummary: string;
  cities: string[];
  nightsTotal: number;
  nightsSplit: string;
  hotels: ComboHotelStop[];
  transfersIncluded: boolean;
  excursionsIncluded: string[];
  price: number;
  oldPrice?: number;
  departureCity: string;
  departureDate: string;
  airline: string;
  flight: string;
  img: string;
  rating: number;
  saved?: boolean;
  kompasTourCode: string;
  kompasOnlineUrl?: string;
  itinerary: { day: number; title: string; desc: string }[];
}

export interface FlightTicket {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureCity: string;
  departureAirportCode: string;
  arrivalCity: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  flightDuration: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'round_trip' | 'one_way';
  flightType: 'direct' | 'transit';
  baggage: string;
  cabinClass: 'economy' | 'business';
  seatsLeft: number;
  price: number;
  oldPrice?: number;
  isCharter: boolean;
  kompasFlightCode: string;
}

export interface HotelOnly {
  id: string;
  name: string;
  resort: string;
  country: string;
  stars: string;
  rating: number;
  reviewsCount: number;
  roomType: string;
  mealType: 'RO' | 'BB' | 'HB' | 'FB' | 'AI' | 'UAI';
  mealDesc: string;
  pricePerNight: number;
  nightsCount: number;
  totalPrice: number;
  oldPrice?: number;
  amenities: string[];
  distanceToBeach?: string;
  img: string;
  gallery?: string[];
  address?: string;
  kompasHotelCode: string;
  kompasOnlineUrl?: string;
  saved?: boolean;
}

