import React, { lazy, Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { TourPackage, PriceAlert, SearchServiceMode, ComboTour, FlightTicket, HotelOnly } from '../types';
import { ActiveAlertsModal } from './ActiveAlertsModal';
import { ComboToursView } from './ComboToursView';
import { FlightsView } from './FlightsView';
import { HotelsOnlyView } from './HotelsOnlyView';
import { ServiceModals } from './ServiceModals';
import { CountrySelectCombobox } from './CountrySelectCombobox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BedDouble, Bell, Building2, Compass, Gem, Globe2, Heart, Hotel, Info, MapPin,
  MapPinned, Moon, Plane, PlaneTakeoff, RotateCw, Search, ShieldCheck, Sparkles,
  Tag, Utensils, Users, Waves
} from '@/lib/flaticon-icons';

const AllToursInteractiveMap = lazy(() =>
  import('./GoogleTourMap').then((module) => ({
    default: module.AllToursInteractiveMap
  }))
);
const PriceAlertModal = lazy(() =>
  import('./PriceAlertModal').then((module) => ({ default: module.PriceAlertModal }))
);

interface SearchScreenProps {
  tours: TourPackage[];
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onOpenTourDetails: (tour: TourPackage) => void;
  onQuickBook: (tour: TourPackage, travelersCount?: number, adults?: number, children?: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  priceAlerts?: PriceAlert[];
  onSavePriceAlert?: (alertData: {
    tourId: string;
    tourTitle: string;
    tourLocation: string;
    tourImg: string;
    currentPrice: number;
    targetPrice: number;
    notifyViaPush: boolean;
    notifyViaTelegram: boolean;
    userEmail?: string;
  }) => void;
  onDeletePriceAlert?: (alertId: string) => void;
  onBookCombo?: (combo: ComboTour) => void;
  onBookFlight?: (flight: FlightTicket) => void;
  onBookHotel?: (hotel: HotelOnly) => void;
  comboTours?: ComboTour[];
  flights?: FlightTicket[];
  hotels?: HotelOnly[];
  agencyCommissionRate?: number;
}

// Kompas Tour (online.uz.kompastour.com) Constants
export const KOMPAS_DEPARTURE_CITIES = [
  { code: 'TAS', name: 'Toshkent (TAS)' },
  { code: 'SKD', name: 'Samarqand (SKD)' },
  { code: 'NMA', name: 'Namangan (NMA)' },
  { code: 'FEG', name: "Farg'ona (FEG)" },
  { code: 'BHK', name: 'Buxoro (BHK)' },
  { code: 'UGC', name: 'Urganch (UGC)' }
];

export interface KompasCountry {
  code: string;
  name: string;
  resorts: string[];
  flag: string;
}

export const COUNTRY_FLAG_MAP: Record<string, string> = {
  ALL: '🌐',
  TR: '🇹🇷',
  TURKIYA: '🇹🇷',
  TURKEY: '🇹🇷',
  EG: '🇪🇬',
  MISR: '🇪🇬',
  EGYPT: '🇪🇬',
  AE: '🇦🇪',
  BAA: '🇦🇪',
  UAE: '🇦🇪',
  DUBAY: '🇦🇪',
  DUBAI: '🇦🇪',
  TH: '🇹🇭',
  TAILAND: '🇹🇭',
  THAILAND: '🇹🇭',
  PHUKET: '🇹🇭',
  PATTAYA: '🇹🇭',
  VN: '🇻🇳',
  VETNAM: '🇻🇳',
  VYETNAM: '🇻🇳',
  VIETNAM: '🇻🇳',
  CN: '🇨🇳',
  XITOY: '🇨🇳',
  CHINA: '🇨🇳',
  HAINAN: '🇨🇳',
  MV: '🇲🇻',
  MALDIV: '🇲🇻',
  MALDIVES: '🇲🇻',
  MALE: '🇲🇻',
  ID: '🇮🇩',
  INDONEZIYA: '🇮🇩',
  INDONESIA: '🇮🇩',
  BALI: '🇮🇩',
  GE: '🇬🇪',
  GRUZIYA: '🇬🇪',
  GEORGIA: '🇬🇪',
  LK: '🇱🇰',
  'SHRI-LANKA': '🇱🇰',
  'SRI LANKA': '🇱🇰',
  MY: '🇲🇾',
  MALAYZIYA: '🇲🇾',
  MALAYSIA: '🇲🇾',
  QA: '🇶🇦',
  QATAR: '🇶🇦',
  SA: '🇸🇦',
  SAUDIYA: '🇸🇦',
  'SAUDIYA ARABISTONI': '🇸🇦',
  'SAUDI ARABIA': '🇸🇦',
  OM: '🇴🇲',
  UMMON: '🇴🇲',
  OMAN: '🇴🇲',
  AZ: '🇦🇿',
  OZARBAYJON: '🇦🇿',
  AZERBAIJAN: '🇦🇿',
  CY: '🇨🇾',
  KIPR: '🇨🇾',
  CYPRUS: '🇨🇾',
  ME: '🇲🇪',
  CHERNOGORIYA: '🇲🇪',
  MONTENEGRO: '🇲🇪',
  IT: '🇮🇹',
  ITALIYA: '🇮🇹',
  ITALY: '🇮🇹',
  ES: '🇪🇸',
  ISPANIYA: '🇪🇸',
  SPAIN: '🇪🇸',
  FR: '🇫🇷',
  FRANSIYA: '🇫🇷',
  FRANCE: '🇫🇷',
  CZ: '🇨🇿',
  CHEXIYA: '🇨🇿',
  CZECH: '🇨🇿',
  JP: '🇯🇵',
  YAPONIYA: '🇯🇵',
  JAPAN: '🇯🇵',
  KR: '🇰🇷',
  'JANUBIY KOREYA': '🇰🇷',
  KOREYA: '🇰🇷',
  KOREA: '🇰🇷',
  SC: '🇸🇨',
  SEYSHEL: '🇸🇨',
  SEYCHELLES: '🇸🇨',
  MU: '🇲🇺',
  MAVRIKIY: '🇲🇺',
  MAURITIUS: '🇲🇺',
  IN: '🇮🇳',
  HINDISTON: '🇮🇳',
  INDIA: '🇮🇳',
  GOA: '🇮🇳',
  GR: '🇬🇷',
  GRETSIYA: '🇬🇷',
  GREECE: '🇬🇷',
  UZ: '🇺🇿',
  "O'ZBEKISTON": '🇺🇿',
  UZBEKISTAN: '🇺🇿',
};

export function getCountryFlag(codeOrName?: string): string {
  if (!codeOrName) return '🌐';
  const clean = codeOrName.trim().toUpperCase();
  if (COUNTRY_FLAG_MAP[clean]) return COUNTRY_FLAG_MAP[clean];
  for (const [key, flag] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (clean.includes(key) || key.includes(clean)) return flag;
  }
  return '🌍';
}

export const KOMPAS_COUNTRIES: KompasCountry[] = [
  { code: 'ALL', name: 'Barcha mamlakatlar', flag: '🌐', resorts: ['Barcha kurortlar'] },
  { code: 'TR', name: 'Turkiya', flag: '🇹🇷', resorts: ['Barcha kurortlar', 'Antalya', 'Belek', 'Kemer', 'Alanya', 'Bodrum', 'Istanbul'] },
  { code: 'EG', name: 'Misr', flag: '🇪🇬', resorts: ['Barcha kurortlar', 'Sharm El-Sheikh', 'Hurghada'] },
  { code: 'AE', name: 'BAA', flag: '🇦🇪', resorts: ['Barcha kurortlar', 'Dubay (Palm)', 'Dubay (JBR/Marina)', 'Ras Al Khaimah'] },
  { code: 'TH', name: 'Tailand', flag: '🇹🇭', resorts: ['Barcha kurortlar', 'Phuket', 'Pattaya'] },
  { code: 'VN', name: 'Vetnam', flag: '🇻🇳', resorts: ['Barcha kurortlar', 'Phu Quoc', 'Nha Trang'] },
  { code: 'CN', name: 'Xitoy', flag: '🇨🇳', resorts: ['Barcha kurortlar', 'Sanya (Hainan)'] },
  { code: 'MV', name: 'Maldiv', flag: '🇲🇻', resorts: ['Barcha kurortlar', 'Male / Kaafu Atoll'] },
  { code: 'ID', name: 'Indoneziya', flag: '🇮🇩', resorts: ['Barcha kurortlar', 'Bali'] },
  { code: 'GE', name: 'Gruziya', flag: '🇬🇪', resorts: ['Barcha kurortlar', 'Batumi', 'Tbilisi'] },
  { code: 'LK', name: 'Shri-Lanka', flag: '🇱🇰', resorts: ['Barcha kurortlar', 'Kolombo', 'Bentota'] },
  { code: 'MY', name: 'Malayziya', flag: '🇲🇾', resorts: ['Barcha kurortlar', 'Kuala Lumpur', 'Langkawi'] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', resorts: ['Barcha kurortlar', 'Doha'] },
  { code: 'SA', name: 'Saudiya Arabistoni', flag: '🇸🇦', resorts: ['Barcha kurortlar', 'Jidda', 'Makka', 'Madina', 'Riyoz'] },
  { code: 'OM', name: 'Ummon (Oman)', flag: '🇴🇲', resorts: ['Barcha kurortlar', 'Maskat', 'Salala'] },
  { code: 'AZ', name: 'Ozarbayjon', flag: '🇦🇿', resorts: ['Barcha kurortlar', 'Boku', 'Shahdag'] },
  { code: 'CY', name: 'Kipr', flag: '🇨🇾', resorts: ['Barcha kurortlar', 'Ayia Napa', 'Larnaka', 'Limassol'] },
  { code: 'ME', name: 'Chernogoriya', flag: '🇲🇪', resorts: ['Barcha kurortlar', 'Budva', 'Kotor', 'Tivat'] },
  { code: 'IT', name: 'Italiya', flag: '🇮🇹', resorts: ['Barcha kurortlar', 'Rim', 'Venetsiya', 'Milan'] },
  { code: 'ES', name: 'Ispaniya', flag: '🇪🇸', resorts: ['Barcha kurortlar', 'Barselona', 'Madrid', 'Mayorka'] },
  { code: 'FR', name: 'Fransiya', flag: '🇫🇷', resorts: ['Barcha kurortlar', 'Parij', 'Nitsa'] },
  { code: 'CZ', name: 'Chexiya', flag: '🇨🇿', resorts: ['Barcha kurortlar', 'Praga', 'Karlovi Vari'] },
  { code: 'JP', name: 'Yaponiya', flag: '🇯🇵', resorts: ['Barcha kurortlar', 'Tokio', 'Kioto', 'Osaka'] },
  { code: 'KR', name: 'Janubiy Koreya', flag: '🇰🇷', resorts: ['Barcha kurortlar', 'Seul', 'Jeju'] },
  { code: 'SC', name: 'Seyshel', flag: '🇸🇨', resorts: ['Barcha kurortlar', 'Mae', 'Praslin'] },
  { code: 'MU', name: 'Mavrikiy', flag: '🇲🇺', resorts: ['Barcha kurortlar', 'Port-Lui'] },
  { code: 'IN', name: 'Hindiston (Goa)', flag: '🇮🇳', resorts: ['Barcha kurortlar', 'Shimoliy Goa', 'Janubiy Goa'] },
  { code: 'GR', name: 'Gretsiya', flag: '🇬🇷', resorts: ['Barcha kurortlar', 'Afina', 'Krit', 'Rodos', 'Santorini'] },
  { code: 'UZ', name: "O'zbekiston", flag: '🇺🇿', resorts: ['Barcha kurortlar', 'Toshkent', 'Samarqand', 'Buxoro', 'Xiva', 'Zomin'] }
];

export const KOMPAS_MEAL_TYPES = [
  { code: 'ALL', label: 'Barchasi' },
  { code: 'UAI', label: 'UAI (Ultra All Inclusive)' },
  { code: 'AI', label: 'AI (All Inclusive)' },
  { code: 'FB', label: 'FB (Full Board / 3 mahal)' },
  { code: 'HB', label: 'HB (Half Board / 2 mahal)' },
  { code: 'BB', label: 'BB (Bed & Breakfast / Nonushta)' }
];

export const KOMPAS_HOTEL_STARS = [
  { code: 'ALL', label: 'Barchasi' },
  { code: '5_DELUXE', label: '5★ Deluxe VIP' },
  { code: '5', label: '5★ Yulduz' },
  { code: '4', label: '4★+ / 4★' }
];

export const KOMPAS_AIRLINES = [
  'Barcha aviakompaniyalar',
  'Uzbekistan Airways',
  'Centrum Air',
  'Air Cairo',
  'FlyDubai',
  'Qanot Sharq',
  'FlyOne'
];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  tours,
  onToggleSave,
  onOpenTourDetails,
  onQuickBook,
  onShowToast,
  priceAlerts = [],
  onSavePriceAlert,
  onDeletePriceAlert,
  onBookCombo,
  onBookFlight,
  onBookHotel,
  comboTours = [],
  flights = [],
  hotels = [],
  agencyCommissionRate = 0
}) => {
  // Service Mode State ('tours' | 'combo' | 'flights' | 'hotels')
  const [serviceMode, setServiceMode] = useState<SearchServiceMode>('tours');
  const [selectedComboTour, setSelectedComboTour] = useState<ComboTour | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightTicket | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelOnly | null>(null);

  // Kompas Tour Filter States
  const [departureCity, setDepartureCity] = useState<string>('Toshkent (TAS)');
  const [countryCode, setCountryCode] = useState<string>('TR');
  const [selectedType, setSelectedType] = useState<string>('ALL'); // Tour Type / Category
  const [selectedResort, setSelectedResort] = useState<string>('Barcha kurortlar');
  const [nightsFilter, setNightsFilter] = useState<string>('ALL'); // 'ALL' | '5-6' | '7-8' | '9-11' | '12+'
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [selectedMeal, setSelectedMeal] = useState<string>('ALL');
  const [selectedStars, setSelectedStars] = useState<string>('ALL');
  const [selectedAirline, setSelectedAirline] = useState<string>('Barcha aviakompaniyalar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(300);
  const [maxPrice, setMaxPrice] = useState<number>(8000);

  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'UZS'>('USD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liveTours, setLiveTours] = useState<TourPackage[]>([]);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // Modals & Panels
  const [selectedAlertTour, setSelectedAlertTour] = useState<TourPackage | null>(null);
  const [isActiveAlertsModalOpen, setIsActiveAlertsModalOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);

  // Temporary state for Advanced Filter modal
  const [tempMinPrice, setTempMinPrice] = useState<number>(300);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(2000);
  const [tempMeal, setTempMeal] = useState<string>('ALL');
  const [tempStars, setTempStars] = useState<string>('ALL');

  // Total travelers
  const totalTravelers = adultsCount + childrenCount;

  // Active country object
  const currentCountry = useMemo(() => {
    return KOMPAS_COUNTRIES.find((c) => c.code === countryCode) || KOMPAS_COUNTRIES[1];
  }, [countryCode]);

  // Resorts list for selected country
  const availableResorts = useMemo(() => {
    return currentCountry.resorts;
  }, [currentCountry]);

  // Execute live search straight against online.uz.kompastour.com
  const executeLiveSearch = useCallback(async (
    targetCountry = countryCode,
    targetResort = selectedResort,
    targetCity = departureCity,
    targetQuery = searchQuery,
    targetNights = nightsFilter,
    targetAdults = adultsCount,
    targetChildren = childrenCount
  ) => {
    setIsLoading(true);
    try {
      let nights_from = '5';
      let nights_till = '14';
      if (targetNights && targetNights !== 'ALL' && targetNights !== '') {
        if (targetNights === '5-6') {
          nights_from = '5';
          nights_till = '6';
        } else if (targetNights === '7-8') {
          nights_from = '7';
          nights_till = '8';
        } else if (targetNights === '9-11') {
          nights_from = '9';
          nights_till = '11';
        } else if (targetNights === '12+') {
          nights_from = '12';
          nights_till = '21';
        } else if (targetNights.includes('-')) {
          const parts = targetNights.split('-');
          nights_from = parts[0];
          nights_till = parts[1] || parts[0];
        } else {
          const num = parseInt(targetNights, 10);
          if (!isNaN(num) && num > 0) {
            nights_from = String(num);
            nights_till = String(num);
          }
        }
      }

      const params = new URLSearchParams({
        departure: targetCity,
        country: targetCountry,
        adult: String(targetAdults),
        child: String(targetChildren),
        nights_from,
        nights_till
      });
      if (targetResort && targetResort !== 'Barcha kurortlar') params.set('resort', targetResort);
      if (targetQuery.trim()) params.set('q', targetQuery.trim());

      const res = await fetch(`/api/kompas/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tours) && data.tours.length > 0) {
        setLiveTours(data.tours);
        setIsLiveActive(true);
        onShowToast(`Jonli qidiruv: ${data.tours.length} ta turpaket topildi. Ko'rsatilgan narxlar so'rov natijasiga asoslangan.`, 'success');
      } else {
        onShowToast(`Qidiruv natijalari yangilandi`, 'info');
      }
    } catch (err) {
      console.warn('Live search failed:', err);
      onShowToast('Jonli tur qidiruvida xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [adultsCount, childrenCount, countryCode, selectedResort, departureCity, searchQuery, nightsFilter, onShowToast]);

  // Initial load live fetch
  useEffect(() => {
    executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, childrenCount);
  }, [countryCode]);

  // Handle Country Change
  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    setSelectedResort('Barcha kurortlar');
    executeLiveSearch(newCode, 'Barcha kurortlar', departureCity, searchQuery, nightsFilter, adultsCount, childrenCount);
  };

  // Trigger search with micro-loader
  const triggerSearch = () => {
    executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter);
  };

  // Currency Converter helper
  const formatPrice = (usd: number): string => {
    if (currency === 'UZS') {
      const uzs = usd * 12950;
      return `${uzs.toLocaleString()} so'm`;
    }
    if (currency === 'EUR') {
      const eur = Math.round(usd * 0.92);
      return `€${eur}`;
    }
    return `$${usd}`;
  };

  // Filter parsing logic
  const filteredTours = useMemo(() => {
    const currentPool = tours;
    return currentPool.filter((tour) => {
      // 1. Departure City
      if (departureCity && tour.departureCity && !tour.isLiveKompas) {
        const cityShort = departureCity.split(' ')[0].toLowerCase();
        if (!tour.departureCity.toLowerCase().includes(cityShort)) {
          return false;
        }
      }

      // 2. Country
      if (countryCode !== 'ALL' && !tour.isLiveKompas) {
        const countryName = currentCountry.name.toLowerCase();
        const tourCountry = (tour.country || '').toLowerCase();
        const tourLoc = tour.location.toLowerCase();
        if (!tourCountry.includes(countryName) && !tourLoc.includes(countryName)) {
          return false;
        }
      }

      // 3. Resort
      if (selectedResort !== 'Barcha kurortlar') {
        const resortLow = selectedResort.toLowerCase();
        const tourResort = (tour.resort || '').toLowerCase();
        const tourLoc = tour.location.toLowerCase();
        if (!tourResort.includes(resortLow) && !tourLoc.includes(resortLow)) {
          return false;
        }
      }

      // 4. Meal Plan
      if (selectedMeal !== 'ALL') {
        if (tour.mealType) {
          if (tour.mealType !== selectedMeal) return false;
        } else {
          const tagLow = tour.tag.toLowerCase();
          if (selectedMeal === 'UAI' && !tagLow.includes('ultra')) return false;
          if (selectedMeal === 'AI' && !tagLow.includes('all')) return false;
          if (selectedMeal === 'BB' && !tagLow.includes('bb') && !tagLow.includes('nonushta')) return false;
        }
      }

      // 5. Hotel Stars
      if (selectedStars !== 'ALL') {
        if (selectedStars === '5_DELUXE') {
          if (tour.hotelStars !== '5★ Deluxe' && !tour.tag.toLowerCase().includes('luxury') && !tour.title.includes('Deluxe')) {
            return false;
          }
        } else if (selectedStars === '5') {
          if (!tour.is5Star) return false;
        } else if (selectedStars === '4') {
          if (tour.is5Star) return false;
        }
      }

      // 6. Airline
      if (selectedAirline !== 'Barcha aviakompaniyalar') {
        const airLow = selectedAirline.toLowerCase();
        const flightStr = (tour.flight + ' ' + (tour.airline || '')).toLowerCase();
        if (!flightStr.includes(airLow)) return false;
      }

      // 7. Nights / Days Duration
      if (nightsFilter && nightsFilter !== 'ALL' && nightsFilter !== '') {
        const n = tour.nightsCount || (tour.nights.match(/\d+/) ? parseInt(tour.nights.match(/\d+/)![0], 10) : 7);
        if (nightsFilter === '5-6') {
          if (n < 5 || n > 6) return false;
        } else if (nightsFilter === '7-8') {
          if (n < 7 || n > 8) return false;
        } else if (nightsFilter === '9-11') {
          if (n < 9 || n > 11) return false;
        } else if (nightsFilter === '12+') {
          if (n < 12) return false;
        } else if (nightsFilter.includes('-')) {
          const [minStr, maxStr] = nightsFilter.split('-');
          const min = parseInt(minStr, 10);
          const max = parseInt(maxStr, 10);
          if (n < min || n > max) return false;
        } else {
          const targetNum = parseInt(nightsFilter, 10);
          if (!isNaN(targetNum) && targetNum > 0) {
            if (n !== targetNum) return false;
          }
        }
      }

      // 8. Price range
      if (tour.price < minPrice || tour.price > maxPrice) {
        return false;
      }

      // 9. Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = tour.title.toLowerCase().includes(q);
        const matchLoc = tour.location.toLowerCase().includes(q);
        const matchTag = tour.tag.toLowerCase().includes(q);
        const matchCode = (tour.kompasTourCode || '').toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchTag && !matchCode) return false;
      }

      // 10. Tour Type / Category
      if (selectedType !== 'ALL') {
        const typeLow = selectedType.toLowerCase();
        const matchBadge = tour.badgeType && tour.badgeType.toLowerCase() === typeLow;
        const matchCategory = tour.category && tour.category.toLowerCase().includes(typeLow);
        const matchTag = tour.tag && tour.tag.toLowerCase().includes(typeLow);
        if (!matchBadge && !matchCategory && !matchTag) return false;
      }

      return true;
    });
  }, [
    liveTours,
    tours,
    departureCity,
    countryCode,
    selectedType,
    currentCountry,
    selectedResort,
    selectedMeal,
    selectedStars,
    selectedAirline,
    nightsFilter,
    minPrice,
    maxPrice,
    searchQuery
  ]);

  // Fallback to all tours if 0 matches
  const isNoExactMatch = filteredTours.length === 0;
  const displayTours = isNoExactMatch ? tours : filteredTours;

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (countryCode !== 'ALL') count++;
    if (selectedType !== 'ALL') count++;
    if (selectedResort !== 'Barcha kurortlar') count++;
    if (selectedMeal !== 'ALL') count++;
    if (selectedStars !== 'ALL') count++;
    if (selectedAirline !== 'Barcha aviakompaniyalar') count++;
    if (nightsFilter && nightsFilter !== 'ALL' && nightsFilter !== '') count++;
    if (minPrice > 300 || maxPrice < 2000) count++;
    return count;
  }, [countryCode, selectedType, selectedResort, selectedMeal, selectedStars, selectedAirline, nightsFilter, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setCountryCode('ALL');
    setSelectedType('ALL');
    setSelectedResort('Barcha kurortlar');
    setSelectedMeal('ALL');
    setSelectedStars('ALL');
    setSelectedAirline('Barcha aviakompaniyalar');
    setNightsFilter('ALL');
    setMinPrice(300);
    setMaxPrice(2000);
    setSearchQuery('');
    onShowToast("Barcha filtrlar qayta tiklandi (Barcha turlar)", 'info');
  };

  return (
    <div className="space-y-3.5 pb-24 select-none font-sans">
      <section className="relative isolate overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-background to-violet-50 px-5 py-5 shadow-sm dark:border-indigo-400/20 dark:from-indigo-950/60 dark:via-card dark:to-violet-950/40 sm:px-7 sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-20 -z-10 size-64 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-3 gap-1.5 border border-indigo-200/70 bg-white/70 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-950/50 dark:text-indigo-200">
              <Sparkles className="size-3.5" />
              SayrHub bilan sayohatni boshlang
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Keyingi manzilingiz qayer?
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Jonli turpaketlar, aviachiptalar va mehmonxonalarni bir joyda taqqoslang.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background/80 p-1">
              {(['USD', 'EUR', 'UZS'] as const).map((curr) => (
                <Button
                  key={curr}
                  type="button"
                  variant={currency === curr ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrency(curr)}
                  className="h-7 px-2.5 text-[11px] font-semibold"
                >
                  {curr === 'USD' ? '$ USD' : curr === 'EUR' ? '€ EUR' : "so'm"}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              id="btn-open-google-tour-map"
              variant="outline"
              size="sm"
              onClick={() => setIsMapModalOpen(true)}
              className="h-9 gap-1.5 bg-background/80"
              title="Mehmonxonalarni Google Xaritasida ko'rish"
            >
              <MapPinned className="size-4 text-primary" />
              Xarita
            </Button>
            {priceAlerts && priceAlerts.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsActiveAlertsModalOpen(true)}
                className="h-9 gap-1.5 bg-background/80"
                title="Mening narx signallarim"
              >
                <Bell className="size-4 text-primary" />
                <Badge variant="default" className="flex size-5 items-center justify-center p-0 text-[10px]">
                  {priceAlerts.length}
                </Badge>
                <span className="hidden sm:inline">Signallar</span>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-200/60 pt-4 text-sm dark:border-indigo-300/15">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PlaneTakeoff className="size-4 text-primary" />
            <span><strong className="font-semibold text-foreground">{displayTours.length} ta</strong> mavjud turpaket</span>
            <span aria-hidden="true">·</span>
            <span>{departureCity}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
            className="h-8 gap-1.5 text-primary hover:text-primary"
          >
            <Compass className="size-4" />
            {isFormCollapsed ? 'Qidiruv filtrlarini ochish' : 'Filtrlarni yig‘ish'}
          </Button>
        </div>
      </section>

      {/* SERVICE MODE TABS: Turpaketlar | Combo Turlar | Aviabiletlar | Mehmonxonalar */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl border border-border bg-muted/60 shadow-xs">
        <Button
          type="button"
          id="tab-mode-tours"
          variant={serviceMode === 'tours' ? 'default' : 'ghost'}
          onClick={() => setServiceMode('tours')}
          className="h-auto py-2 px-1 rounded-xl flex flex-col items-center gap-0.5"
        >
          <Waves className="size-4" />
          <span className="text-[10px] leading-tight font-bold">Turpaketlar</span>
        </Button>

        <Button
          type="button"
          id="tab-mode-combo"
          variant={serviceMode === 'combo' ? 'default' : 'ghost'}
          onClick={() => setServiceMode('combo')}
          className="h-auto py-2 px-1 rounded-xl flex flex-col items-center gap-0.5"
        >
          <RotateCw className="size-4" />
          <span className="text-[10px] leading-tight font-bold">Combo</span>
        </Button>

        <Button
          type="button"
          id="tab-mode-flights"
          variant={serviceMode === 'flights' ? 'default' : 'ghost'}
          onClick={() => setServiceMode('flights')}
          className="h-auto py-2 px-1 rounded-xl flex flex-col items-center gap-0.5"
        >
          <Plane className="size-4" />
          <span className="text-[10px] leading-tight font-bold">Biletlar</span>
        </Button>

        <Button
          type="button"
          id="tab-mode-hotels"
          variant={serviceMode === 'hotels' ? 'default' : 'ghost'}
          onClick={() => setServiceMode('hotels')}
          className="h-auto py-2 px-1 rounded-xl flex flex-col items-center gap-0.5"
        >
          <Hotel className="size-4" />
          <span className="text-[10px] leading-tight font-bold">Mehmonxona</span>
        </Button>
      </div>

      {/* RENDER ACTIVE MODE */}
      {serviceMode === 'combo' && (
        <ComboToursView
          comboTours={comboTours}
          onSelectComboTour={(combo) => setSelectedComboTour(combo)}
          onQuickBookCombo={(combo) => {
            if (onBookCombo) {
              onBookCombo(combo);
            }
            setSelectedComboTour(combo);
          }}
          onShowToast={onShowToast}
        />
      )}

      {serviceMode === 'flights' && (
        <FlightsView
          flights={flights}
          onSelectFlight={(flight) => setSelectedFlight(flight)}
          onQuickBookFlight={(flight) => {
            if (onBookFlight) {
              onBookFlight(flight);
            }
            setSelectedFlight(flight);
          }}
          onShowToast={onShowToast}
        />
      )}

      {serviceMode === 'hotels' && (
        <HotelsOnlyView
          hotels={hotels}
          onSelectHotel={(hotel) => setSelectedHotel(hotel)}
          onQuickBookHotel={(hotel) => {
            if (onBookHotel) {
              onBookHotel(hotel);
            }
            setSelectedHotel(hotel);
          }}
          onShowToast={onShowToast}
        />
      )}

      {serviceMode === 'tours' && (
        <>
      {/* 2. MAIN KOMPAS TOUR FILTER FORM (online.uz.kompastour.com/search_tour) */}
      {!isFormCollapsed && (
        <div
          className="rounded-3xl p-4 space-y-3.5 animate-fadeIn border transition-colors"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-border)',
            boxShadow: 'var(--tw-card-shadow)'
          }}
        >
          {/* Top row: Departure City & Country */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Город вылета (Uchish shahri) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                <span className="inline-flex items-center gap-1"><PlaneTakeoff className="w-3 h-3" /> Uchish shahri (Город вылета)</span>
              </label>
              <select
                id="kompas-departure-city"
                value={departureCity}
                onChange={(e) => {
                  setDepartureCity(e.target.value);
                  triggerSearch();
                }}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                {KOMPAS_DEPARTURE_CITIES.map((city) => (
                  <option
                    key={city.code}
                    value={city.name}
                    style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Страна (Mamlakat) - Select ham Type ham, davlat bayrog'i nomining oldida */}
            <CountrySelectCombobox
              id="kompas-country"
              countries={KOMPAS_COUNTRIES}
              selectedCode={countryCode}
              onSelectCountry={handleCountryChange}
              label="Borish mamlakati (Страна)"
              placeholder="Davlat nomini yozing..."
            />
          </div>

          {/* Second row: Resort & Tour Type (Sana olib tashlandi, Tur Toifasi Select qo'shildi) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Курорт (Kurort) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                <span className="inline-flex items-center gap-1"><Waves className="w-3 h-3" /> Kurort (Курорт)</span>
              </label>
              <select
                id="kompas-resort"
                value={selectedResort}
                onChange={(e) => {
                  setSelectedResort(e.target.value);
                  triggerSearch();
                }}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                {availableResorts.map((resort) => (
                  <option
                    key={resort}
                    value={resort}
                    style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                  >
                    {resort}
                  </option>
                ))}
              </select>
            </div>

            {/* Tur Toifasi (Type) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                htmlFor="search-tour-type"
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" /> Tur Toifasi (Type)</span>
              </label>
              <select
                id="search-tour-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                <option value="ALL" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Barcha Turlar (Hammasi)</option>
                <option value="beach" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Plyaj (Beach)</option>
                <option value="luxury" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Premium / Deluxe</option>
                <option value="ultra" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Ultra All Inclusive</option>
                <option value="family" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Oilaviy (Family)</option>
                <option value="culture" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Madaniy / Tarixiy</option>
                <option value="cheap" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Hamyonbop / Qaynoq</option>
              </select>
            </div>
          </div>

          {/* Third row: Nights & Travelers */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Kunlar / tunlar soni (Foydalanuvchi type qiladi) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors relative"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <label
                  htmlFor="kompas-nights"
                  className="text-[10px] block font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--tw-text-sub)' }}
                >
                  <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" /> Kunlar soni (Kechalar)</span>
                </label>
                {nightsFilter && nightsFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => {
                      setNightsFilter('ALL');
                      executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, 'ALL', adultsCount, childrenCount);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white tap-bounce"
                    title="Barcha kunlarga qaytarish"
                  >
                    Barchasi ✕
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  id="kompas-nights"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  placeholder="Masalan: 7"
                  value={nightsFilter === 'ALL' ? '' : nightsFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNightsFilter(val || 'ALL');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, childrenCount);
                    }
                  }}
                  onBlur={() => {
                    executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, childrenCount);
                  }}
                  className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0"
                  style={{ color: 'var(--tw-text-main)' }}
                />
                {nightsFilter && nightsFilter !== 'ALL' && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: 'var(--tw-accent-light)',
                      color: 'var(--tw-accent)'
                    }}
                  >
                    kun
                  </span>
                )}
                {/* Stepper buttons - / + */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(nightsFilter, 10);
                      const next = isNaN(cur) || cur <= 1 ? 1 : cur - 1;
                      setNightsFilter(String(next));
                      executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, String(next), adultsCount, childrenCount);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-black tap-bounce transition"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      color: 'var(--tw-text-main)'
                    }}
                    title="1 kunga kamaytirish"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(nightsFilter, 10);
                      const next = isNaN(cur) ? 7 : cur + 1;
                      setNightsFilter(String(next));
                      executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, String(next), adultsCount, childrenCount);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-black tap-bounce transition"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      color: 'var(--tw-text-main)'
                    }}
                    title="1 kunga oshirish"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Туристы (Sayyohlar) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> Sayyohlar (Туристы)</span>
              </label>
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: 'var(--tw-text-main)' }}
                  >
                    {adultsCount} kattalar
                  </span>
                  <div className="flex items-center gap-0.5 ml-1">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setAdultsCount(num);
                          executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, num, childrenCount);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-bold tap-bounce transition ${
                          adultsCount === num ? 'shadow-xs' : ''
                        }`}
                        style={{
                          backgroundColor: adultsCount === num ? 'var(--tw-accent)' : 'var(--tw-surface)',
                          color: adultsCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-muted)'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 border-l pl-2"
                  style={{ borderColor: 'var(--tw-border)' }}
                >
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--tw-text-sub)' }}
                  >
                    bola:
                  </span>
                  {[0, 1, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setChildrenCount(num);
                        executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, num);
                      }}
                      className="w-4 h-4 rounded text-[9px] font-bold tap-bounce"
                      style={{
                        backgroundColor: childrenCount === num ? 'var(--tw-accent)' : 'var(--tw-surface)',
                        color: childrenCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-muted)'
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fourth row: Hotel Category & Meal Plan */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Категория отеля (Yulduzlar) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                Toifa (Категория)
              </label>
              <select
                id="kompas-stars"
                value={selectedStars}
                onChange={(e) => setSelectedStars(e.target.value)}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                {KOMPAS_HOTEL_STARS.map((s) => (
                  <option
                    key={s.code}
                    value={s.code}
                    style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Питание (Ovqatlanish turi) */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                <span className="inline-flex items-center gap-1"><Utensils className="w-3 h-3" /> Ovqatlanish (Питание)</span>
              </label>
              <select
                id="kompas-meals"
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                {KOMPAS_MEAL_TYPES.map((m) => (
                  <option
                    key={m.code}
                    value={m.code}
                    style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                  >
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fifth row: Airline & Hotel Name Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Aviakompaniya */}
            <div
              className="p-2.5 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label
                className="text-[10px] block font-semibold mb-0.5"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                <span className="inline-flex items-center gap-1"><Plane className="w-3 h-3" /> Aviatashuvchi (Авиакомпания)</span>
              </label>
              <select
                id="kompas-airline"
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="w-full bg-transparent text-xs font-bold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                {KOMPAS_AIRLINES.map((air) => (
                  <option
                    key={air}
                    value={air}
                    style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                  >
                    {air}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input for Hotel Title */}
            <div
              className="p-2.5 rounded-2xl border flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <label
                  className="text-[10px] block font-semibold leading-none mb-1"
                  style={{ color: 'var(--tw-text-sub)' }}
                >
                  Mehmonxona nomi
                </label>
                <input
                  type="text"
                  placeholder="Rixos, Atlantis, Albatros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs border-0 p-0 focus:ring-0"
                  style={{ color: 'var(--tw-text-main)' }}
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs px-1 tap-bounce"
                  style={{ color: 'var(--tw-text-sub)' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Country Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span
              className="text-[10px] font-bold uppercase shrink-0"
              style={{ color: 'var(--tw-text-sub)' }}
            >
              Ommabop:
            </span>
            {KOMPAS_COUNTRIES.filter((c) => c.code !== 'ALL').map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountryChange(c.code)}
                className="px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition tap-bounce border"
                style={{
                  backgroundColor: countryCode === c.code ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                  color: countryCode === c.code ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                  borderColor: countryCode === c.code ? 'var(--tw-accent)' : 'var(--tw-border)'
                }}
              >
                <Globe2 className="inline w-3 h-3" /> <span className="ml-1">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            id="btn-execute-search"
            onClick={triggerSearch}
            className="w-full py-3.5 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 tap-bounce transition shadow-md"
            style={{
              backgroundColor: 'var(--tw-accent)',
              color: 'var(--tw-accent-contrast)'
            }}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>Qidirish ({filteredTours.length} ta turpaket topildi)</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          className="rounded-3xl p-6 text-center space-y-3 animate-fadeIn border"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-accent)'
          }}
        >
          <div
            className="w-10 h-10 mx-auto rounded-full border-4 animate-spin"
            style={{
              borderColor: 'var(--tw-accent-light)',
              borderTopColor: 'var(--tw-accent)'
            }}
          ></div>
          <h4 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>
            Jonli tizim so'rovi bajarilmoqda...
          </h4>
          <p className="text-xs" style={{ color: 'var(--tw-text-sub)' }}>
            {departureCity} dan {currentCountry.name} yo'nalishidagi charter reyslar va xonalar tekshirilmoqda.
          </p>
        </div>
      )}

      {/* 3. ACTIVE FILTERS STRIP */}
      {activeFiltersCount > 0 && (
        <div
          className="p-2 rounded-2xl border flex items-center justify-between gap-2 overflow-x-auto no-scrollbar"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-border)'
          }}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase pl-1 shrink-0" style={{ color: 'var(--tw-text-muted)' }}>
              Filtrlar:
            </span>
            {countryCode !== 'ALL' && (
              <span
                className="px-2 py-0.5 rounded-lg border text-[10px] font-bold shrink-0 flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  borderColor: 'var(--tw-accent-border)',
                  color: 'var(--tw-accent)'
                }}
              >
                <Globe2 className="w-3 h-3" />
                <span>{currentCountry.name}</span>
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold shrink-0">
                <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" /> {selectedType === 'beach' ? 'Plyaj' : selectedType === 'luxury' ? 'Premium' : selectedType === 'ultra' ? 'Ultra All Inclusive' : selectedType === 'family' ? 'Oilaviy' : selectedType === 'culture' ? 'Madaniy' : 'Hamyonbop'}</span>
              </span>
            )}
            {nightsFilter && nightsFilter !== 'ALL' && (
              <span
                className="px-2 py-0.5 rounded-lg border text-[10px] font-bold shrink-0 flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  borderColor: 'var(--tw-accent-border)',
                  color: 'var(--tw-accent)'
                }}
              >
                <Moon className="w-3 h-3" />
                <span>{nightsFilter} kun / kecha</span>
              </span>
            )}
            {selectedResort !== 'Barcha kurortlar' && (
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold shrink-0">
                {selectedResort}
              </span>
            )}
            {selectedMeal !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold shrink-0">
                {selectedMeal}
              </span>
            )}
            {selectedStars !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold shrink-0">
                {selectedStars === '5_DELUXE' ? '5★ Deluxe' : selectedStars === '5' ? '5★' : '4★'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[10px] text-slate-400 hover:text-white font-medium whitespace-nowrap px-1 shrink-0 tap-bounce"
          >
            Tozalash ✕
          </button>
        </div>
      )}

      {/* Notice if zero matches */}
      {isNoExactMatch && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>Tanlangan parametrlar bo'yicha tur paketlar topilmadi. Barcha mavjud takliflar ko'rsatilmoqda:</span>
        </div>
      )}

      {/* 4. RESULTS SECTION - TOUR CARDS */}
      <div id="tour-cards-section" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span
            className="text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: 'var(--tw-text-main)' }}
          >
            <Globe2 className="w-4 h-4 text-primary" />
            <span>{currentCountry.name} bo'yicha SayrHub turpaketlari ({displayTours.length})</span>
          </span>
          <span
            className="text-[10px] sm:text-xs"
            style={{ color: 'var(--tw-text-sub)' }}
          >
            Valyuta: <strong style={{ color: 'var(--tw-text-main)' }}>{currency}</strong>
          </span>
        </div>

        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-5" id="tour-cards-container">
          {displayTours.map((tour) => {
            const activeAlert = priceAlerts.find((a) => a.tourId === tour.id);

            return (
              <Card
                key={tour.id}
                className="rounded-2xl overflow-hidden border-border bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-40 w-full bg-muted">
                    <img src={tour.img} alt={tour.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[230px]">
                      <Badge variant="default" className="text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wider shadow-xs">
                        {tour.mealType || tour.tag}
                      </Badge>

                    </div>

                    {/* Price Alert Bell */}
                    <button
                      id={`btn-price-alert-${tour.id}`}
                      className={`absolute top-2.5 right-11 h-7 px-2 rounded-full backdrop-blur-md flex items-center gap-1 tap-bounce transition border text-xs cursor-pointer ${
                        activeAlert
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-lg shadow-amber-500/40 animate-pulse'
                          : 'bg-black/50 hover:bg-black/75 text-white/90 border-white/20'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlertTour(tour);
                      }}
                      type="button"
                      title={activeAlert ? `Narx signali: < $${activeAlert.targetPrice}` : "Narx tushishiga signal o'rnatish"}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      {activeAlert ? (
                        <span className="text-[10px] font-black font-mono leading-none">&lt;${activeAlert.targetPrice}</span>
                      ) : (
                        <span className="text-[9px] font-semibold hidden sm:inline">Signal</span>
                      )}
                    </button>

                    {/* Favorite button */}
                    <button
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white tap-bounce cursor-pointer"
                      onClick={(e) => onToggleSave(tour.id, e)}
                      type="button"
                    >
                      <Heart className={`w-4 h-4 ${tour.saved ? 'fill-current text-rose-500' : ''}`} />
                    </button>

                    {/* Rating & Nights on banner */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                        ★ {tour.rating} ({tour.hotelStars || '5★'})
                      </span>
                      <span className="text-[10px] text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" /> {tour.nights}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold leading-tight text-foreground">
                          {tour.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {tour.location}</span>
                        </p>
                        {tour.roomType && (
                          <p className="text-xs font-semibold text-primary mt-0.5">
                            <span className="inline-flex items-center gap-1"><BedDouble className="w-3 h-3" /> {tour.roomType}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {tour.oldPrice && (
                          <span className="text-xs line-through text-muted-foreground mr-1">
                            {formatPrice(tour.oldPrice)}
                          </span>
                        )}
                        <p className="text-lg font-black text-primary leading-none">
                          {formatPrice(tour.price)}
                        </p>
                        <span className="text-[10px] block mt-0.5 font-medium text-muted-foreground">
                          {totalTravelers > 1
                            ? `${formatPrice(tour.price * totalTravelers)} jami (${totalTravelers} kishi)`
                            : "1 kishi uchun to'liq narx"}
                        </span>

                      </div>
                    </div>

                    {/* Flight & Inclusions bar */}
                    <div className="p-2.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                        <Plane className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium">{tour.flight}</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">Transfer ✓ Sug'urta ✓</span>
                    </div>

                    {/* Agency Trust Info */}
                    <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-semibold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>SayrHub</span>
                      <span className="text-sky-400 dark:text-sky-500 ml-auto shrink-0">✓ Rasmiy Operator</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 flex items-center gap-2">


                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl text-xs font-semibold h-9"
                    onClick={() => onOpenTourDetails(tour)}
                    type="button"
                  >
                    Batafsil
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="px-4 text-xs font-bold rounded-xl h-9 gap-1.5"
                    onClick={() => onQuickBook(tour, totalTravelers, adultsCount, childrenCount)}
                    type="button"
                  >
                    <span>Bron qilish</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      </>
      )}

      {/* SERVICE MODALS: Combo Tour Details, Flight E-Ticket, Hotel-Only Voucher */}
      <ServiceModals
        selectedComboTour={selectedComboTour}
        onCloseComboTour={() => setSelectedComboTour(null)}
        selectedFlight={selectedFlight}
        onCloseFlight={() => setSelectedFlight(null)}
        selectedHotel={selectedHotel}
        onCloseHotel={() => setSelectedHotel(null)}
        onShowToast={onShowToast}
        onBookCombo={onBookCombo}
        onBookFlight={onBookFlight}
        onBookHotel={onBookHotel}
      />

      {/* 5. PRICE ALERT MODAL */}
      {selectedAlertTour && (
        <Suspense fallback={null}>
        <PriceAlertModal
          isOpen={!!selectedAlertTour}
          tour={selectedAlertTour}
          existingAlert={priceAlerts.find((a) => a.tourId === selectedAlertTour.id)}
          onClose={() => setSelectedAlertTour(null)}
          onSaveAlert={(alertData) => {
            if (onSavePriceAlert) {
              onSavePriceAlert(alertData);
            }
            setSelectedAlertTour(null);
          }}
          onDeleteAlert={(alertId) => {
            if (onDeletePriceAlert) {
              onDeletePriceAlert(alertId);
            }
            setSelectedAlertTour(null);
          }}
        />
        </Suspense>
      )}

      {/* 6. ACTIVE ALERTS LIST MODAL */}
      {isActiveAlertsModalOpen && (
        <ActiveAlertsModal
          isOpen={isActiveAlertsModalOpen}
          alerts={priceAlerts}
          tours={tours}
          onClose={() => setIsActiveAlertsModalOpen(false)}
          onEditAlert={(tour) => {
            setIsActiveAlertsModalOpen(false);
            setSelectedAlertTour(tour);
          }}
          onDeleteAlert={(alertId) => {
            if (onDeletePriceAlert) {
              onDeletePriceAlert(alertId);
            }
          }}
        />
      )}

      {/* 5. GOOGLE MAPS ALL TOURS INTERACTIVE MODAL */}
      {isMapModalOpen && (
        <div
          id="modal-interactive-google-map"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end animate-fadeIn"
        >
          <div
            className="w-full h-[92vh] max-w-2xl mx-auto rounded-t-[32px] overflow-hidden border-t flex flex-col shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
              <AllToursInteractiveMap
                tours={displayTours.length > 0 ? displayTours : tours}
                selectedCountry={currentCountry.code === 'ALL' ? undefined : currentCountry.name}
                onSelectTour={(tour) => {
                  setIsMapModalOpen(false);
                  onOpenTourDetails(tour);
                }}
                onClose={() => setIsMapModalOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};
