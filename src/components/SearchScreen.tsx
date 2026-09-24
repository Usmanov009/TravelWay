import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TourPackage, PriceAlert, SearchServiceMode, ComboTour, FlightTicket, HotelOnly } from '../types';
import { PriceAlertModal } from './PriceAlertModal';
import { ActiveAlertsModal } from './ActiveAlertsModal';
import { AllToursInteractiveMap } from './GoogleTourMap';
import { ComboToursView } from './ComboToursView';
import { FlightsView } from './FlightsView';
import { HotelsOnlyView } from './HotelsOnlyView';
import { ServiceModals } from './ServiceModals';
import { INITIAL_COMBO_TOURS, INITIAL_FLIGHTS, INITIAL_HOTELS_ONLY } from '../data/extraServicesData';

interface SearchScreenProps {
  tours: TourPackage[];
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onOpenTourDetails: (tour: TourPackage) => void;
  onQuickBook: (tour: TourPackage, travelersCount?: number) => void;
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
  onSimulatePriceDrop?: (tourId: string, simulatedPrice: number) => void;
  onBookCombo?: (combo: ComboTour) => void;
  onBookFlight?: (flight: FlightTicket) => void;
  onBookHotel?: (hotel: HotelOnly) => void;
  comboTours?: ComboTour[];
  flights?: FlightTicket[];
  hotels?: HotelOnly[];
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
  flag: string;
  resorts: string[];
}

export const KOMPAS_COUNTRIES: KompasCountry[] = [
  {
    code: 'ALL',
    name: 'Barcha mamlakatlar',
    flag: '🌍',
    resorts: ['Barcha kurortlar']
  },
  {
    code: 'TR',
    name: 'Turkiya',
    flag: '🇹🇷',
    resorts: ['Barcha kurortlar', 'Antalya', 'Belek', 'Kemer', 'Alanya', 'Bodrum', 'Istanbul']
  },
  {
    code: 'EG',
    name: 'Misr',
    flag: '🇪🇬',
    resorts: ['Barcha kurortlar', 'Sharm El-Sheikh', 'Hurghada']
  },
  {
    code: 'AE',
    name: 'BAA',
    flag: '🇦🇪',
    resorts: ['Barcha kurortlar', 'Dubay (Palm)', 'Dubay (JBR/Marina)', 'Ras Al Khaimah']
  },
  {
    code: 'TH',
    name: 'Tailand',
    flag: '🇹🇭',
    resorts: ['Barcha kurortlar', 'Phuket', 'Pattaya']
  },
  {
    code: 'VN',
    name: 'Vetnam',
    flag: '🇻🇳',
    resorts: ['Barcha kurortlar', 'Phu Quoc', 'Nha Trang']
  },
  {
    code: 'CN',
    name: 'Xitoy',
    flag: '🇨🇳',
    resorts: ['Barcha kurortlar', 'Sanya (Hainan)']
  },
  {
    code: 'MV',
    name: 'Maldiv',
    flag: '🇲🇻',
    resorts: ['Barcha kurortlar', 'Male / Kaafu Atoll']
  },
  {
    code: 'ID',
    name: 'Indoneziya',
    flag: '🇮🇩',
    resorts: ['Barcha kurortlar', 'Bali']
  },
  {
    code: 'GE',
    name: 'Gruziya',
    flag: '🇬🇪',
    resorts: ['Barcha kurortlar', 'Batumi']
  }
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
  onSimulatePriceDrop,
  onBookCombo,
  onBookFlight,
  onBookHotel,
  comboTours = INITIAL_COMBO_TOURS,
  flights = INITIAL_FLIGHTS,
  hotels = INITIAL_HOTELS_ONLY
}) => {
  // Service Mode State ('tours' | 'combo' | 'flights' | 'hotels')
  const [serviceMode, setServiceMode] = useState<SearchServiceMode>('tours');
  const [selectedComboTour, setSelectedComboTour] = useState<ComboTour | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightTicket | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelOnly | null>(null);

  // Kompas Tour Filter States
  const [departureCity, setDepartureCity] = useState<string>('Toshkent (TAS)');
  const [countryCode, setCountryCode] = useState<string>('TR');
  const [selectedResort, setSelectedResort] = useState<string>('Barcha kurortlar');
  const [departureDate, setDepartureDate] = useState<string>(() => new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10));
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
    targetChildren = childrenCount,
    targetDate = departureDate
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        departure: targetCity,
        country: targetCountry,
        adult: String(targetAdults),
        child: String(targetChildren),
        nights_from: targetNights === '5-6' ? '5' : targetNights === '7-8' ? '7' : targetNights === '9-11' ? '9' : targetNights === '12+' ? '12' : '6',
        nights_till: targetNights === '5-6' ? '6' : targetNights === '7-8' ? '8' : targetNights === '9-11' ? '11' : targetNights === '12+' ? '15' : '10'
      });
      if (targetDate) {
        params.set('checkin_beg', targetDate.replace(/-/g, ''));
      }
      if (targetResort && targetResort !== 'Barcha kurortlar') params.set('resort', targetResort);
      if (targetQuery.trim()) params.set('q', targetQuery.trim());

      const res = await fetch(`/api/kompas/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tours) && data.tours.length > 0) {
        setLiveTours(data.tours);
        setIsLiveActive(true);
        onShowToast(`Kompas Tour: ${data.tours.length} ta turpaket (1:1 rasmiy narxda) olindi!`, 'success');
      } else {
        onShowToast(`online.uz.kompastour.com natijalari yangilandi`, 'info');
      }
    } catch (err) {
      console.warn('Live Kompas search failed:', err);
      onShowToast(`Kompas Tour turlari yangilandi`, 'info');
    } finally {
      setIsLoading(false);
    }
  }, [adultsCount, childrenCount, countryCode, selectedResort, departureCity, searchQuery, nightsFilter, departureDate, onShowToast]);

  // Initial load live fetch
  useEffect(() => {
    executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, childrenCount, departureDate);
  }, [countryCode]);

  // Handle Country Change
  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    setSelectedResort('Barcha kurortlar');
    executeLiveSearch(newCode, 'Barcha kurortlar', departureCity, searchQuery, nightsFilter, adultsCount, childrenCount, departureDate);
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
    const currentPool = liveTours.length > 0 ? liveTours : tours;
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

      // 7. Nights Duration
      if (nightsFilter !== 'ALL') {
        const n = tour.nightsCount || (tour.nights.match(/\d+/) ? parseInt(tour.nights.match(/\d+/)![0], 10) : 7);
        if (nightsFilter === '5-6' && (n < 5 || n > 6)) return false;
        if (nightsFilter === '7-8' && (n < 7 || n > 8)) return false;
        if (nightsFilter === '9-11' && (n < 9 || n > 11)) return false;
        if (nightsFilter === '12+' && n < 12) return false;
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

      return true;
    });
  }, [
    liveTours,
    tours,
    departureCity,
    countryCode,
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
    if (selectedResort !== 'Barcha kurortlar') count++;
    if (selectedMeal !== 'ALL') count++;
    if (selectedStars !== 'ALL') count++;
    if (selectedAirline !== 'Barcha aviakompaniyalar') count++;
    if (nightsFilter !== 'ALL') count++;
    if (minPrice > 300 || maxPrice < 2000) count++;
    return count;
  }, [countryCode, selectedResort, selectedMeal, selectedStars, selectedAirline, nightsFilter, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setCountryCode('ALL');
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
      {/* 1. TRAVELWAY OFFICIAL HEADER BAR */}
      <div
        className="rounded-3xl p-3.5 border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          boxShadow: 'var(--tw-card-shadow)'
        }}
      >
        <div
          className="flex items-center justify-between gap-2 border-b pb-2.5"
          style={{ borderColor: 'var(--tw-border)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-xs transition-colors"
              style={{
                backgroundColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)'
              }}
            >
              ✈️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-black text-xs uppercase tracking-wider"
                  style={{ color: 'var(--tw-text-main)' }}
                >
                  TRAVELWAY
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--tw-accent-light)',
                    color: 'var(--tw-accent)',
                    borderColor: 'var(--tw-accent-border)'
                  }}
                >
                  ONLAYN QIDIRUV
                </span>
              </div>
              <p
                className="text-[10px] truncate"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                Arzon turpaketlar, charter reyslar & narx signallari
              </p>
            </div>
          </div>

          {/* Currency Switcher */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl border shrink-0 transition-colors"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            {(['USD', 'EUR', 'UZS'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition tap-bounce ${
                  currency === curr ? 'shadow-xs' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: currency === curr ? 'var(--tw-accent)' : 'transparent',
                  color: currency === curr ? 'var(--tw-accent-contrast)' : 'var(--tw-text-muted)'
                }}
              >
                {curr === 'USD' ? '$' : curr === 'EUR' ? '€' : "so'm"}
              </button>
            ))}
          </div>
        </div>

        {/* Live Info and Alerts */}
        <div className="flex items-center justify-between pt-2.5">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold"
              style={{ color: 'var(--tw-text-main)' }}
            >
              {displayTours.length} ta mavjud turpaket
            </span>
            <span
              className="text-[10px]"
              style={{ color: 'var(--tw-text-sub)' }}
            >
              ({departureCity})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-open-google-tour-map"
              onClick={() => setIsMapModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold tap-bounce shadow-xs transition"
              style={{
                backgroundColor: 'var(--tw-accent-light)',
                borderColor: 'var(--tw-accent)',
                color: 'var(--tw-accent)'
              }}
              title="Mehmonxonalarni Google Xaritasida ko'rish"
            >
              <span>🗺️</span>
              <span className="text-[10px]">Xarita</span>
            </button>

            {priceAlerts && priceAlerts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsActiveAlertsModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold tap-bounce"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-accent)'
                }}
                title="Mening narx signallarim"
              >
                <span>🔔</span>
                <span
                  className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                >
                  {priceAlerts.length}
                </span>
                <span className="text-[10px] hidden sm:inline">Signallar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="px-2 py-1 rounded-xl border text-xs font-semibold tap-bounce flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
            >
              <span>{isFormCollapsed ? 'Filtrni ochish ▾' : 'Yig‘ish ▴'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SERVICE MODE TABS: Turpaketlar | Combo Turlar | Aviabiletlar | Mehmonxonalar */}
      <div
        className="grid grid-cols-4 gap-1 p-1 rounded-2xl border"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          boxShadow: 'var(--tw-card-shadow)'
        }}
      >
        <button
          type="button"
          id="tab-mode-tours"
          onClick={() => setServiceMode('tours')}
          className={`py-2 px-1 rounded-xl text-center font-black transition-all flex flex-col items-center gap-0.5 tap-bounce ${
            serviceMode === 'tours' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: serviceMode === 'tours' ? 'var(--tw-accent)' : 'transparent',
            color: serviceMode === 'tours' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
          }}
        >
          <span className="text-sm">🏖️</span>
          <span className="text-[10px] leading-tight font-extrabold">Turpaketlar</span>
        </button>

        <button
          type="button"
          id="tab-mode-combo"
          onClick={() => setServiceMode('combo')}
          className={`py-2 px-1 rounded-xl text-center font-black transition-all flex flex-col items-center gap-0.5 tap-bounce ${
            serviceMode === 'combo' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: serviceMode === 'combo' ? 'var(--tw-accent)' : 'transparent',
            color: serviceMode === 'combo' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
          }}
        >
          <span className="text-sm">🔄</span>
          <span className="text-[10px] leading-tight font-extrabold">Combo</span>
        </button>

        <button
          type="button"
          id="tab-mode-flights"
          onClick={() => setServiceMode('flights')}
          className={`py-2 px-1 rounded-xl text-center font-black transition-all flex flex-col items-center gap-0.5 tap-bounce ${
            serviceMode === 'flights' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: serviceMode === 'flights' ? 'var(--tw-accent)' : 'transparent',
            color: serviceMode === 'flights' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
          }}
        >
          <span className="text-sm">✈️</span>
          <span className="text-[10px] leading-tight font-extrabold">Biletlar</span>
        </button>

        <button
          type="button"
          id="tab-mode-hotels"
          onClick={() => setServiceMode('hotels')}
          className={`py-2 px-1 rounded-xl text-center font-black transition-all flex flex-col items-center gap-0.5 tap-bounce ${
            serviceMode === 'hotels' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: serviceMode === 'hotels' ? 'var(--tw-accent)' : 'transparent',
            color: serviceMode === 'hotels' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
          }}
        >
          <span className="text-sm">🏨</span>
          <span className="text-[10px] leading-tight font-extrabold">Mehmonxona</span>
        </button>
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
                🛫 Uchish shahri (Город вылета)
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

            {/* Страна (Mamlakat) */}
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
                🌍 Borish mamlakati (Страна)
              </label>
              <select
                id="kompas-country"
                value={countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                {KOMPAS_COUNTRIES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                  >
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second row: Resort & Dates */}
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
                🏖 Kurort (Курорт)
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

            {/* Даты вылета (Uchish sanasi) */}
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
                📅 Uchish sanasi (Дата вылета)
              </label>
              <input
                id="kompas-date"
                type="date"
                value={departureDate}
                onChange={(e) => {
                  setDepartureDate(e.target.value);
                  executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, childrenCount, e.target.value);
                }}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              />
            </div>
          </div>

          {/* Third row: Nights & Travelers */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Ночей (Tunlar soni) */}
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
                🌙 Tunlar soni (Ночей)
              </label>
              <select
                id="kompas-nights"
                value={nightsFilter}
                onChange={(e) => {
                  setNightsFilter(e.target.value);
                  executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, e.target.value, adultsCount, childrenCount, departureDate);
                }}
                className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
                style={{ color: 'var(--tw-text-main)' }}
              >
                <option value="ALL" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>Barchasi (5 - 14 kecha)</option>
                <option value="5-6" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>5 - 6 kecha</option>
                <option value="7-8" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>7 - 8 kecha (Standart)</option>
                <option value="9-11" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>9 - 11 kecha</option>
                <option value="12+" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>12+ kecha (Uzoq dam olish)</option>
              </select>
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
                👥 Sayyohlar (Туристы)
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
                          executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, num, childrenCount, departureDate);
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
                        executeLiveSearch(countryCode, selectedResort, departureCity, searchQuery, nightsFilter, adultsCount, num, departureDate);
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
                ⭐️ Toifa (Категория)
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
                🍽 Ovqatlanish (Питание)
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
                ✈️ Aviatashuvchi (Авиакомпания)
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
              <span className="text-xs" style={{ color: 'var(--tw-text-sub)' }}>🔍</span>
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
                <span>{c.flag}</span> <span className="ml-1">{c.name}</span>
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
            <span>Qidirish ({filteredTours.length} ta Kompas tur topildi)</span>
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
            Kompas Tour tizimi so'rovi bajarilmoqda...
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
                className="px-2 py-0.5 rounded-lg border text-[10px] font-bold shrink-0"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  borderColor: 'var(--tw-accent-border)',
                  color: 'var(--tw-accent)'
                }}
              >
                {currentCountry.name}
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
          <span>ℹ️</span>
          <span>Tanlangan parametrlar bo'yicha tur paketlar topilmadi. Barcha mavjud Kompas Tour takliflari ko'rsatilmoqda:</span>
        </div>
      )}

      {/* 4. RESULTS SECTION - TOUR CARDS */}
      <div className="space-y-3" id="tour-cards-container">
        <div className="flex items-center justify-between px-1">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--tw-text-main)' }}
          >
            {currentCountry.name} bo'yicha TravelWay turpaketlari ({displayTours.length})
          </span>
          <span
            className="text-[10px]"
            style={{ color: 'var(--tw-text-sub)' }}
          >
            Valyuta: <strong style={{ color: 'var(--tw-text-main)' }}>{currency}</strong> • Hisoblash & Spesifikatsiya
          </span>
        </div>

          {displayTours.map((tour) => {
            const activeAlert = priceAlerts.find((a) => a.tourId === tour.id);

            return (
              <div
                key={tour.id}
                className="rounded-2xl overflow-hidden border transition-colors shadow-sm"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)',
                  boxShadow: 'var(--tw-card-shadow)'
                }}
              >
                {/* Image Banner */}
                <div className="relative h-36 w-full bg-slate-200">
                  <img src={tour.img} alt={tour.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[230px]">
                    <span
                      className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
                      style={{
                        backgroundColor: 'var(--tw-accent)',
                        color: 'var(--tw-accent-contrast)'
                      }}
                    >
                      {tour.mealType || tour.tag}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-emerald-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {tour.kompasTourCode || 'TW-UZ'}
                    </span>
                    {tour.isLiveKompas && (
                      <span className="bg-emerald-600/95 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span>Kompas 1:1 Narx</span>
                      </span>
                    )}
                  </div>

                  {/* Price Alert Bell */}
                  <button
                    id={`btn-price-alert-${tour.id}`}
                    className={`absolute top-2.5 right-11 h-7 px-2 rounded-full backdrop-blur-md flex items-center gap-1 tap-bounce transition border text-xs ${
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
                    <span className="text-xs">🔔</span>
                    {activeAlert ? (
                      <span className="text-[10px] font-black font-mono leading-none">&lt;${activeAlert.targetPrice}</span>
                    ) : (
                      <span className="text-[9px] font-semibold hidden sm:inline">Signal</span>
                    )}
                  </button>

                  {/* Favorite button */}
                  <button
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white tap-bounce"
                    onClick={(e) => onToggleSave(tour.id, e)}
                    type="button"
                  >
                    {tour.saved ? '❤️' : '🤍'}
                  </button>

                  {/* Rating & Nights on banner */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                      ★ {tour.rating} ({tour.hotelStars || '5★'})
                    </span>
                    <span className="text-[10px] text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      🌙 {tour.nights}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        className="text-xs font-extrabold leading-tight"
                        style={{ color: 'var(--tw-text-main)' }}
                      >
                        {tour.title}
                      </h4>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: 'var(--tw-text-sub)' }}
                      >
                        📍 {tour.location}
                      </p>
                      {tour.roomType && (
                        <p
                          className="text-[10px] font-medium mt-0.5"
                          style={{ color: 'var(--tw-accent)' }}
                        >
                          🛏 {tour.roomType}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {tour.oldPrice && (
                        <span
                          className="text-[10px] line-through mr-1"
                          style={{ color: 'var(--tw-text-muted)' }}
                        >
                          {formatPrice(tour.oldPrice)}
                        </span>
                      )}
                      <p
                        className="text-base font-black leading-none"
                        style={{ color: 'var(--tw-accent)' }}
                      >
                        {formatPrice(tour.price)}
                      </p>
                      <span
                        className="text-[8px] block mt-0.5 font-medium"
                        style={{ color: 'var(--tw-text-sub)' }}
                      >
                        {tour.isLiveKompas
                          ? (adultsCount > 1 
                              ? `${formatPrice(Math.round(tour.price / adultsCount))} / kishi (${totalTravelers} kishi jami)`
                              : "1 kishi uchun to'liq narx")
                          : (totalTravelers > 1
                              ? `${formatPrice(tour.price * totalTravelers)} jami (${totalTravelers} kishi)`
                              : "1 kishi uchun to'liq narx")}
                      </span>
                    </div>
                  </div>

                  {/* Flight & Inclusions bar */}
                  <div
                    className="p-2.5 rounded-xl border flex items-center justify-between text-[10px] transition-colors"
                    style={{
                      backgroundColor: 'var(--tw-subtle)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-sub)'
                    }}
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                      <span>✈️</span>
                      <span className="truncate font-medium">{tour.flight}</span>
                    </div>
                    <span className="text-emerald-600 font-semibold shrink-0">Transfer ✓ Sug'urta ✓</span>
                  </div>

                  {/* Action Buttons (NO BOOKING FLOW!) */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {tour.kompasOnlineUrl && (
                      <a
                        href={tour.kompasOnlineUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center tap-bounce shadow-xs"
                        style={{
                          backgroundColor: 'var(--tw-subtle)',
                          borderColor: 'var(--tw-border)',
                          color: 'var(--tw-text-main)'
                        }}
                        title="online.uz.kompastour.com saytida ochish"
                      >
                        🌐
                      </a>
                    )}

                    <button
                      className="flex-1 py-2.5 text-xs font-bold rounded-xl tap-bounce transition border"
                      style={{
                        backgroundColor: 'var(--tw-subtle)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-main)'
                      }}
                      onClick={() => onOpenTourDetails(tour)}
                      type="button"
                    >
                      Batafsil ma'lumot
                    </button>

                    <button
                      className="px-4 py-2.5 text-xs font-black rounded-xl tap-bounce shadow-md flex items-center gap-1.5 transition"
                      style={{
                        backgroundColor: 'var(--tw-accent)',
                        color: 'var(--tw-accent-contrast)'
                      }}
                      onClick={() => onQuickBook(tour, totalTravelers)}
                      type="button"
                    >
                      <span>Spesifikatsiya & Hisob</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          onSimulatePriceDrop={(tId, simPrice) => {
            if (onSimulatePriceDrop) {
              onSimulatePriceDrop(tId, simPrice);
            }
          }}
        />
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
          onSimulatePriceDrop={(tId, simPrice) => {
            if (onSimulatePriceDrop) {
              onSimulatePriceDrop(tId, simPrice);
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
            <AllToursInteractiveMap
              tours={displayTours.length > 0 ? displayTours : tours}
              selectedCountry={currentCountry.code === 'ALL' ? undefined : currentCountry.name}
              onSelectTour={(tour) => {
                setIsMapModalOpen(false);
                onOpenTourDetails(tour);
              }}
              onClose={() => setIsMapModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
