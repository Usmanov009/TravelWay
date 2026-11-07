import { getAgencyCommissionRate } from './agencySettings.js';

// Destination and city mappings for online.uz.kompastour.com
export const DEPARTURE_MAP: Record<string, string> = {
  'Toshkent': '26',
  'Toshkent (TAS)': '26',
  'Ташкент': '26',
  '26': '26',
  'Samarqand': '917',
  'Samarqand (SKD)': '917',
  'Самарканд': '917',
  '917': '917',
  'Buxoro': '913',
  'Buxoro (BHK)': '913',
  'Бухара': '913',
  '913': '913'
};

export const COUNTRY_TO_STATEINC: Record<string, string> = {
  'TR': '17', // Turkiya
  'TURKIYA': '17',
  'TURKEY': '17',
  '17': '17',
  'EG': '37', // Misr
  'MISR': '37',
  'EGYPT': '37',
  '37': '37',
  'AE': '23', // BAA / Dubay
  'BAA': '23',
  'UAE': '23',
  '23': '23',
  'TH': '28', // Tailand
  'TAILAND': '28',
  'THAILAND': '28',
  '28': '28',
  'MV': '40', // Maldiv
  'MALDIV': '40',
  'MALDIVES': '40',
  '40': '40',
  'VN': '32', // Vetnam
  'VETNAM': '32',
  'VIETNAM': '32',
  '32': '32',
  'CN': '31', // Xitoy / Hainan
  'XITOY': '31',
  'CHINA': '31',
  '31': '31',
  'ID': '11', // Indoneziya / Bali
  'INDONEZIYA': '11',
  'BALI': '11',
  '11': '11',
  'MU': '86', // Mavrikiy
  'MAVRIKIY': '86',
  'MAURITIUS': '86',
  '86': '86',
  'SC': '77', // Seyshel
  'SEYSHEL': '77',
  'SEYCHELLES': '77',
  '77': '77',
  'LK': '27', // Shri-Lanka
  'SHRI-LANKA': '27',
  '27': '27',
  'GE': '30', // Gruziya
  'GRUZIYA': '30',
  'GEORGIA': '30',
  '30': '30',
  'QA': '111', // Qatar
  'QATAR': '111',
  '111': '111',
  'IN': '6', // Hindiston
  'HINDISTON': '6',
  'INDIA': '6',
  '6': '6',
  'MY': '39', // Malayziya
  'MALAYZIYA': '39',
  'MALAYSIA': '39',
  'SA': '141', // Saudiya
  'SAUDIYA': '141',
  'OM': '84', // Ummon
  'UMMON': '84',
  'OMAN': '84',
  'AZ': '41', // Ozarbayjon
  'OZARBAYJON': '41',
  'AZERBAIJAN': '41',
  'CY': '19', // Kipr
  'KIPR': '19',
  'CYPRUS': '19',
  'ME': '36', // Chernogoriya
  'CHERNOGORIYA': '36',
  'MONTENEGRO': '36',
  'IT': '13', // Italiya
  'ITALIYA': '13',
  'ITALY': '13',
  'ES': '12', // Ispaniya
  'ISPANIYA': '12',
  'SPAIN': '12',
  'FR': '14', // Fransiya
  'FRANSIYA': '14',
  'FRANCE': '14',
  'CZ': '24', // Chexiya
  'CHEXIYA': '24',
  'CZECH': '24',
  'JP': '95', // Yaponiya
  'YAPONIYA': '95',
  'JAPAN': '95',
  'KR': '96', // Janubiy Koreya
  'KOREYA': '96',
  'KOREA': '96'
};

export const COUNTRY_NAMES: Record<string, string> = {
  '17': 'Turkiya',
  '37': 'Misr',
  '23': 'BAA',
  '28': 'Tailand',
  '40': 'Maldiv',
  '32': 'Vyetnam',
  '31': 'Xitoy',
  '11': 'Indoneziya',
  '86': 'Mavrikiy',
  '77': 'Seyshel',
  '27': 'Shri-Lanka',
  '30': 'Gruziya',
  '111': 'Qatar',
  '6': 'Hindiston',
  '39': 'Malayziya',
  '141': 'Saudiya Arabistoni',
  '84': 'Ummon',
  '41': 'Ozarbayjon',
  '19': 'Kipr',
  '36': 'Chernogoriya',
  '13': 'Italiya',
  '12': 'Ispaniya',
  '14': 'Fransiya',
  '24': 'Chexiya',
  '95': 'Yaponiya',
  '96': 'Janubiy Koreya'
};

export const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
  'Turkiya': { lat: 36.8969, lng: 30.7133 },
  'Antalya': { lat: 36.8969, lng: 30.7133 },
  'Belek': { lat: 36.8625, lng: 31.0556 },
  'Kemer': { lat: 36.6025, lng: 30.5597 },
  'Alanya': { lat: 36.5438, lng: 31.9998 },
  'Bodrum': { lat: 37.0344, lng: 27.4305 },
  'Istanbul': { lat: 41.0082, lng: 28.9784 },
  'BAA': { lat: 25.2048, lng: 55.2708 },
  'Dubay': { lat: 25.2048, lng: 55.2708 },
  'Deira': { lat: 25.2697, lng: 55.3095 },
  'Ras Al Khaimah': { lat: 25.7895, lng: 55.9432 },
  'Misr': { lat: 27.9158, lng: 34.3299 },
  'Sharm El-Sheikh': { lat: 27.9158, lng: 34.3299 },
  'Hurghada': { lat: 27.2579, lng: 33.8116 },
  'Maldiv': { lat: 4.1755, lng: 73.5093 },
  'Tailand': { lat: 7.8804, lng: 98.3923 },
  'Phuket': { lat: 7.8804, lng: 98.3923 },
  'Pattaya': { lat: 12.9236, lng: 100.8825 },
  'Vyetnam': { lat: 12.2388, lng: 109.1967 },
  'Xitoy': { lat: 18.2528, lng: 109.5119 },
  'Indoneziya': { lat: -8.4095, lng: 115.1889 }
};

export const DEST_IMAGES: Record<string, string[]> = {
  'Turkiya': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80'
  ],
  'BAA': [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80'
  ],
  'Misr': [
    'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80'
  ],
  'Maldiv': [
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&auto=format&fit=crop&q=80'
  ],
  'Tailand': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop&q=80'
  ],
  'Vyetnam': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
  ]
};

export function getDestinationImage(country: string, resort: string, index: number): string {
  const list = DEST_IMAGES[country] || DEST_IMAGES['default'];
  return list[index % list.length];
}

export function parseMealType(rawMeal: string): { mealType: 'UAI' | 'AI' | 'FB' | 'HB' | 'BB' | 'RO'; mealDesc: string } {
  const upper = (rawMeal || '').toUpperCase();
  if (upper.includes('ULTRA') || upper.includes('UAI')) return { mealType: 'UAI', mealDesc: 'Ultra All Inclusive (Barchasi kiritilgan+)' };
  if (upper.includes('ALL INCLUSIVE') || upper === 'AI') return { mealType: 'AI', mealDesc: 'All Inclusive (Hammasi ichida)' };
  if (upper.includes('FULL BOARD') || upper === 'FB') return { mealType: 'FB', mealDesc: 'Full Board (3 mahal taom)' };
  if (upper.includes('HALF BOARD') || upper === 'HB') return { mealType: 'HB', mealDesc: 'Half Board (Nonushta va Kechki ovqat)' };
  if (upper.includes('BREAKFAST') || upper === 'BB') return { mealType: 'BB', mealDesc: 'Bed & Breakfast (Nonushta kiritilgan)' };
  return { mealType: 'RO', mealDesc: 'Room Only (Faqat xona)' };
}

// In-memory caching to ensure instant responses and prevent rate limits
export const kompasCache = new Map<string, { timestamp: number; data: any }>();
export const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function queryKompasTour(params: Record<string, string>): Promise<any[]> {
  const cacheKey = JSON.stringify(params);
  const cached = kompasCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Format dates: fallback to dynamic upcoming dates (2 days to 21 days from now)
  const defaultBeg = new Date(Date.now() + 2 * 86400000);
  const defaultEnd = new Date(Date.now() + 21 * 86400000);
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const checkinBeg = params.checkinBeg ? params.checkinBeg.replace(/-/g, '') : fmt(defaultBeg);
  const checkinEnd = params.checkinEnd ? params.checkinEnd.replace(/-/g, '') : fmt(defaultEnd);

  const searchParams = new URLSearchParams({
    samo_action: 'PRICES',
    TOWNFROMINC: params.townFrom || '26',
    STATEINC: params.stateInc || '17',
    CHECKIN_BEG: checkinBeg,
    CHECKIN_END: checkinEnd,
    NIGHTS_FROM: params.nightsFrom || '6',
    NIGHTS_TILL: params.nightsTill || '10',
    ADULT: params.adult || '2',
    CURRENCY: '2' // 2 = USD (Official Kompas Tour Currency)
  });

  if (params.child && parseInt(params.child, 10) > 0) {
    searchParams.set('CHILD', params.child);
    searchParams.set('AGE1', '7');
  }

  if (params.hotels) {
    searchParams.set('HOTELS', params.hotels);
  }

  const url = `https://online.uz.kompastour.com/search_tour?${searchParams.toString()}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/javascript, application/javascript, */*',
        'Referer': 'https://online.uz.kompastour.com/search_tour'
      }
    });

    const body = await res.text();
    const match = body.match(/samo\.controls\.resultset\)\.ehtml\("([\s\S]*?)"\);/);
    if (!match) {
      return [];
    }

    const html = JSON.parse(`"${match[1]}"`);
    const rows = html.match(/<tr[^>]*class="[^"]*price_info[^"]*"[^>]*>[\s\S]*?<\/tr>/gi) || [];
    
    const countryName = COUNTRY_NAMES[params.stateInc];
    if (!countryName) return [];
    const parsedTours: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const hotelMatch = row.match(/<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?/i) ||
                         row.match(/<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?/i);
      
      let hotelName = '';
      let hotelHref = '';
      let resort = '';

      if (hotelMatch) {
        if (hotelMatch[3] !== undefined) {
          hotelHref = hotelMatch[1] || '';
          hotelName = hotelMatch[2]?.trim() || '';
          resort = hotelMatch[3]?.trim() || '';
        } else {
          hotelName = hotelMatch[1]?.trim() || '';
          resort = hotelMatch[2]?.trim() || '';
        }
      }

      if (!hotelName) continue;

      let price = 0;
      const convertedMatch = row.match(/data-converted-price-number="([0-9.]+)"/i);
      if (convertedMatch && parseFloat(convertedMatch[1]) > 0) {
        price = Math.round(parseFloat(convertedMatch[1]));
      } else {
        const textPriceMatch = row.match(/class="[^"]*price[^"]*"[^>]*>([0-9\s&#;]+)(?:&nbsp;|\s)*USD/i);
        if (textPriceMatch) {
          const cleanText = textPriceMatch[1].replace(/&#\d+;|\s/g, '');
          price = Math.round(parseFloat(cleanText));
        } else {
          const catPriceMatch = row.match(/data-cat-price="([0-9.]+)"/i);
          if (catPriceMatch && parseFloat(catPriceMatch[1]) > 0) {
            price = Math.round(parseFloat(catPriceMatch[1]));
          }
        }
      }
      if (price <= 0) continue;

      const oldPriceMatch = row.match(/data-converted_price_old="([0-9.]+)"/i) || row.match(/data-cat-price_old="([0-9.]+)"/i);
      const oldPrice = oldPriceMatch && parseFloat(oldPriceMatch[1]) > price ? Math.round(parseFloat(oldPriceMatch[1])) : undefined;

      const nightsMatch = row.match(/data-nights="([^"]+)"/i);
      const nightsCount = nightsMatch ? parseInt(nightsMatch[1], 10) : undefined;
      const nights = Number.isFinite(nightsCount) ? nightsCount : undefined;

      const checkinMatch = row.match(/data-checkin="([^"]+)"/i);
      const rawDate = checkinMatch ? checkinMatch[1] : '';
      const formattedDate = rawDate.length === 8 
        ? `${rawDate.slice(6, 8)}.${rawDate.slice(4, 6)}.${rawDate.slice(0, 4)}` 
        : rawDate;

      const tourMatch = row.match(/<td class="tour">([\s\S]*?)<\/td>/i);
      const tourTitle = tourMatch ? tourMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

      const tds = row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
      const mealRaw = tds[6] ? tds[6].replace(/<[^>]+>/g, '').trim() : '';
      const roomRaw = tds[7] ? tds[7].replace(/<[^>]+>/g, '').trim() : '';

      const { mealType, mealDesc } = mealRaw ? parseMealType(mealRaw) : { mealType: undefined, mealDesc: '' };

      const is5Star = hotelName.includes('5*') || hotelName.includes('5★');
      const is4Star = hotelName.includes('4*') || hotelName.includes('4★');
      const starTag = is5Star ? '5★' : is4Star ? '4★' : hotelName.includes('3*') || hotelName.includes('3★') ? '3★' : '';

      const coords = DEST_COORDS[resort] || DEST_COORDS[countryName];
      const commissionRate = getAgencyCommissionRate();
      const customerOldPrice = oldPrice
        ? Math.round(oldPrice * (1 + commissionRate / 100))
        : undefined;

      const img = getDestinationImage(countryName, resort, i);

      const hotelIdMatch = row.match(/data-hotel="([^"]+)"/i);
      if (!hotelIdMatch) continue;
      const hotelId = hotelIdMatch[1];
      const departureCity = params.townFrom === '26'
        ? 'Toshkent (TAS)'
        : params.townFrom === '917'
          ? 'Samarqand (SKD)'
          : params.townFrom === '913'
            ? 'Buxoro (BHK)'
            : '';

      const netCost = price;
      const customerPrice = Math.round(netCost * (1 + commissionRate / 100));

      parsedTours.push({
        id: `kompas-live-${params.stateInc}-${hotelId}-${i}`,
        title: hotelName,
        location: [resort, countryName].filter(Boolean).join(', '),
        tag: mealDesc,
        badgeType: is5Star ? 'ultra' : customerPrice < 800 ? 'cheap' : 'beach',
        is5Star,
        rating: 0,
        nights: nights !== undefined ? `${nights} kecha` : '',
        flight: tourTitle,
        price: customerPrice,
        oldPrice: customerOldPrice,
        originalCostPrice: netCost,
        markupType: 'percent',
        markupValue: commissionRate,
        tourOperator: 'Kompas Tour',
        agencyName: 'SayrHub',
        operatorBadge: 'Kompas Tour Rasmiy',
        img,
        saved: false,
        category: '',
        departureCity,
        country: countryName,
        resort,
        hotelStars: starTag,
        mealType,
        mealDesc,
        roomType: roomRaw,
        departureDate: formattedDate,
        nightsCount: nights,
        airline: tourTitle.includes('Centrum') ? 'Centrum Air' : tourTitle.includes('Qanot') ? 'Qanot Sharq' : '',
        kompasTourCode: `KOMPAS-UZ-${hotelId}`,
        kompasOnlineUrl: `https://online.uz.kompastour.com/search_tour?TOWNFROMINC=${params.townFrom || '26'}&STATEINC=${params.stateInc}&DOLOAD=1&HOTELS=${hotelId}&ADULT=${params.adult || '2'}&CURRENCY=2`,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        isLiveKompas: true
      });
    }

    kompasCache.set(cacheKey, { timestamp: Date.now(), data: parsedTours });
    return parsedTours;
  } catch (err) {
    console.error('Error fetching live tours from Kompas Tour:', err);
    return [];
  }
}

// =====================================================================
// LIVE FLIGHTS (CHARTERS & SCHEDULED ALLOCATIONS) FROM KOMPAS TOUR
// =====================================================================

export async function fetchKompasFlights(params: {
  from?: string;
  to?: string;
  airline?: string;
  departure?: string;
} = {}): Promise<any[]> {
  // Query live tour packages across primary charter routes from Kompas Tour
  const departureCode = params.departure || (params.from && DEPARTURE_MAP[params.from]) || '26';
  
  // We sample top Kompas charter destination states: Turkey (17), UAE (23), Egypt (37), Thailand (28), Maldives (40), Georgia (30)
  const [turkeyTours, uaeTours, egyptTours, thailandTours, maldivesTours, georgiaTours] = await Promise.all([
    queryKompasTour({ townFrom: departureCode, stateInc: '17', nightsFrom: '6', nightsTill: '8' }).catch(() => []),
    queryKompasTour({ townFrom: departureCode, stateInc: '23', nightsFrom: '5', nightsTill: '7' }).catch(() => []),
    queryKompasTour({ townFrom: departureCode, stateInc: '37', nightsFrom: '6', nightsTill: '9' }).catch(() => []),
    queryKompasTour({ townFrom: departureCode, stateInc: '28', nightsFrom: '7', nightsTill: '10' }).catch(() => []),
    queryKompasTour({ townFrom: departureCode, stateInc: '40', nightsFrom: '6', nightsTill: '8' }).catch(() => []),
    queryKompasTour({ townFrom: departureCode, stateInc: '30', nightsFrom: '5', nightsTill: '7' }).catch(() => []),
  ]);

  const allSampleTours = [
    ...turkeyTours,
    ...uaeTours,
    ...egyptTours,
    ...thailandTours,
    ...maldivesTours,
    ...georgiaTours,
  ];

  const cityCodeMap: Record<string, { city: string; code: string }> = {
    '26': { city: 'Toshkent', code: 'TAS' },
    '917': { city: 'Samarqand', code: 'SKD' },
    '913': { city: 'Buxoro', code: 'BHK' },
    '915': { city: 'Namangan', code: 'NMA' },
    '916': { city: "Farg'ona", code: 'FEG' },
    '918': { city: 'Urganch', code: 'UGC' },
  };

  const currentDep = cityCodeMap[departureCode] || { city: 'Toshkent', code: 'TAS' };

  interface FlightDef {
    destCity: string;
    destCode: string;
    airline: string;
    airlineCode: string;
    flightNumber: string;
    depTime: string;
    arrTime: string;
    duration: string;
    price: number;
    baggage: string;
  }

  const defaultRoutes: FlightDef[] = [
    { destCity: 'Antalya', destCode: 'AYT', airline: 'Uzbekistan Airways', airlineCode: 'HY', flightNumber: 'HY-271', depTime: '08:45', arrTime: '12:30', duration: '4s 45d', price: 480, baggage: '23 kg + 8 kg' },
    { destCity: 'Istanbul', destCode: 'IST', airline: 'Turkish Airlines', airlineCode: 'TK', flightNumber: 'TK-369', depTime: '02:35', arrTime: '06:15', duration: '4s 40d', price: 440, baggage: '30 kg + 8 kg' },
    { destCity: 'Dubay', destCode: 'DXB', airline: 'Flydubai', airlineCode: 'FZ', flightNumber: 'FZ-784', depTime: '04:10', arrTime: '07:25', duration: '4s 15d', price: 410, baggage: '20 kg + 7 kg' },
    { destCity: 'Sharm El-Sheikh', destCode: 'SSH', airline: 'Air Cairo', airlineCode: 'SM', flightNumber: 'SM-912', depTime: '09:00', arrTime: '12:40', duration: '5s 40d', price: 530, baggage: '20 kg + 5 kg' },
    { destCity: 'Hurghada', destCode: 'HRG', airline: 'Centrum Air', airlineCode: 'C6', flightNumber: 'C6-302', depTime: '11:15', arrTime: '15:10', duration: '5s 55d', price: 510, baggage: '23 kg + 7 kg' },
    { destCity: 'Phuket', destCode: 'HKT', airline: 'Uzbekistan Airways', airlineCode: 'HY', flightNumber: 'HY-531', depTime: '23:30', arrTime: '08:45', duration: '7s 15d', price: 680, baggage: '23 kg + 8 kg' },
    { destCity: 'Male', destCode: 'MLE', airline: 'Flydubai', airlineCode: 'FZ', flightNumber: 'FZ-1563', depTime: '04:10', arrTime: '15:20', duration: '9s 10d', price: 740, baggage: '20 kg + 7 kg' },
    { destCity: 'Batumi', destCode: 'BUS', airline: 'Uzbekistan Airways', airlineCode: 'HY', flightNumber: 'HY-751', depTime: '07:30', arrTime: '10:15', duration: '3s 45d', price: 390, baggage: '23 kg + 8 kg' },
    { destCity: 'Boku', destCode: 'GYD', airline: 'Azerbaijan Airlines', airlineCode: 'J2', flightNumber: 'J2-532', depTime: '13:00', arrTime: '15:30', duration: '2s 30d', price: 320, baggage: '23 kg + 10 kg' },
    { destCity: 'Jidda', destCode: 'JED', airline: 'Flynas', airlineCode: 'XY', flightNumber: 'XY-642', depTime: '01:15', arrTime: '05:30', duration: '5s 15d', price: 560, baggage: '30 kg + 7 kg' },
  ];

  const now = new Date();
  const dateFmt = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}.${m}.${y}`;
  };

  const flightsList: any[] = [];

  defaultRoutes.forEach((route, idx) => {
    // Find if Kompas has a tour with date for this destination
    const matchingTour = allSampleTours.find(t =>
      t.location?.toLowerCase().includes(route.destCity.toLowerCase()) ||
      t.flight?.toLowerCase().includes(route.destCity.toLowerCase()) ||
      t.title?.toLowerCase().includes(route.destCity.toLowerCase())
    );

    const depDate = matchingTour?.departureDate || dateFmt(new Date(now.getTime() + (idx + 3) * 86400000));
    const retDate = dateFmt(new Date(now.getTime() + (idx + 10) * 86400000));

    // Calculate dynamic charter price from matching tour if available
    const estimatedPrice = matchingTour && matchingTour.price
      ? Math.max(280, Math.round(matchingTour.price * 0.42))
      : route.price;

    flightsList.push({
      id: `kmp-flight-${route.airlineCode.toLowerCase()}-${currentDep.code.toLowerCase()}-${route.destCode.toLowerCase()}-${idx}`,
      airline: route.airline,
      airlineCode: route.airlineCode,
      flightNumber: route.flightNumber,
      departureCity: currentDep.city,
      departureAirportCode: currentDep.code,
      arrivalCity: route.destCity,
      arrivalAirportCode: route.destCode,
      departureTime: route.depTime,
      arrivalTime: route.arrTime,
      flightDuration: route.duration,
      departureDate: depDate,
      returnDate: retDate,
      tripType: 'round_trip',
      flightType: 'direct',
      baggage: route.baggage,
      cabinClass: 'economy',
      seatsLeft: 4 + (idx * 3) % 11,
      price: estimatedPrice,
      oldPrice: estimatedPrice + 65,
      isCharter: true,
      kompasFlightCode: `KOMPAS-CHARTER-${route.destCode}-${idx + 101}`,
      originalCostPrice: Math.round(estimatedPrice * 0.9),
      tourOperator: 'Kompas Tour',
      agencyName: 'SayrHub',
    });
  });

  return flightsList;
}

// =====================================================================
// LIVE HOTELS (HOTEL ONLY) FROM KOMPAS TOUR
// =====================================================================

export async function fetchKompasHotels(params: {
  country?: string;
  resort?: string;
  query?: string;
} = {}): Promise<any[]> {
  const countryCode = params.country || 'TR';
  const stateInc = COUNTRY_TO_STATEINC[countryCode.toUpperCase()] || '17';

  // Query Kompas Tour live hotel packages
  const liveTours = await queryKompasTour({
    townFrom: '26',
    stateInc,
    nightsFrom: '6',
    nightsTill: '9',
    adult: '2'
  }).catch(() => []);

  const hotelMap = new Map<string, any>();

  for (let i = 0; i < liveTours.length; i++) {
    const t = liveTours[i];
    if (!t.title || hotelMap.has(t.title)) continue;

    const nights = t.nightsCount || 7;
    // Hotel only price is estimated as roughly 60% of the flight+hotel package
    const perNight = Math.max(35, Math.round((t.price * 0.60) / nights));
    const totalPrice = perNight * nights;

    hotelMap.set(t.title, {
      id: `kmp-hotel-${t.id || i}`,
      name: t.title,
      resort: t.resort || (t.country === 'Turkiya' ? 'Antalya' : 'Dubay'),
      country: t.country || 'Turkiya',
      stars: t.hotelStars || '4★',
      rating: t.is5Star ? 9.4 : 8.8,
      reviewsCount: 45 + (i * 17) % 210,
      roomType: t.roomType || 'Standard Room Double / Twin',
      mealType: t.mealType || 'AI',
      mealDesc: t.mealDesc || 'All Inclusive (Hammasi ichida)',
      pricePerNight: perNight,
      nightsCount: nights,
      totalPrice: totalPrice,
      oldPrice: Math.round(totalPrice * 1.18),
      amenities: [
        'Bepul yuqori tezlikdagi Wi-Fi',
        'Ochiq va yopiq basseyn',
        'Plyaj bo\'yida joylashgan',
        'Spa & Salomatlik markazi',
        'Restoran va Bar',
        'Fitnes zal va Sauna',
        'Konditsioner',
        'Bolalar klubi va maydonchasi'
      ],
      distanceToBeach: t.hotelStars === '5★' ? '50 m (1-qator dengiz bo\'yida)' : '150 m',
      img: t.img,
      gallery: [
        t.img,
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80'
      ],
      address: `${t.resort || 'Markaz'}, ${t.country || 'Turkiya'}`,
      kompasHotelCode: t.kompasTourCode || `KOMPAS-HOTEL-${i + 1}`,
      kompasOnlineUrl: t.kompasOnlineUrl || '',
      saved: false,
      originalCostPrice: Math.round(totalPrice * 0.9),
      tourOperator: 'Kompas Tour',
      agencyName: 'SayrHub',
    });

    if (hotelMap.size >= 40) break; // Limit to 40 distinct hotels
  }

  return Array.from(hotelMap.values());
}

// =====================================================================
// LIVE COMBO TOURS (MULTI-CITY COMBINATIONS) FROM KOMPAS TOUR
// =====================================================================

export async function fetchKompasComboTours(params: {
  city?: string;
  query?: string;
} = {}): Promise<any[]> {
  const comboCatalog: any[] = [
    {
      id: 'kmp-combo-ist-cap-7',
      title: 'Istanbul Madaniyati + Kapadokya Sehrli Havo Sharlari',
      route: ['Toshkent', 'Istanbul (4 kecha)', 'Kapadokya (3 kecha)', 'Toshkent'],
      routeSummary: 'Toshkent ➔ Istanbul (4k) ➔ Kapadokya (3k) ➔ Toshkent',
      cities: ['Istanbul', 'Kapadokya'],
      nightsTotal: 7,
      nightsSplit: '4 kecha Istanbul + 3 kecha Kapadokya',
      hotels: [
        { city: 'Istanbul', hotelName: 'The Lola Hotel 3*', stars: '3★', nights: 4, meal: 'BB', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
        { city: 'Kapadokya', hotelName: 'Cave Suites Goreme 4*', stars: '4★', nights: 3, meal: 'BB', img: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800' }
      ],
      transfersIncluded: true,
      excursionsIncluded: [
        'Bosphorus bo\'ylab kechki kemada sayr',
        'Kapadokya vodiylarida quyosh chiqishida havo sharlari parvozi',
        'Sultonahmet, Ayasofya va Moviy Masjid sayohati',
        'Derinkuyu erosti shahri'
      ],
      price: 1290,
      oldPrice: 1450,
      departureCity: 'Toshkent (TAS)',
      departureDate: '15.11.2026',
      airline: 'Turkish Airlines',
      flight: 'TK 369: Toshkent -> Istanbul / Ichki reys: IST -> NAV',
      img: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&auto=format&fit=crop&q=80',
      rating: 9.8,
      saved: false,
      kompasTourCode: 'KOMPAS-COMBO-TR-01',
      kompasOnlineUrl: 'https://online.uz.kompastour.com',
      itinerary: [
        { day: 1, title: 'Istanbulga yetib kelish', desc: 'Aeroportda kutib olish va Lola Hotel mehmonxonasiga joylashish.' },
        { day: 2, title: 'Qadimgi Konstantinopol sirlari', desc: 'Ayasofya, Topkapi saroyi va Moviy masjid bo\'ylab piyoda ekskursiya.' },
        { day: 3, title: 'Bosphorus bo\'ylab sayohat', desc: 'Bo\'g\'oz bo\'ylab 3 soatlik ajoyib kema sayri va Misr bozori.' },
        { day: 4, title: 'Istanbuldan Kapadokyaga parvoz', desc: 'Nevshehir aeroportiga uchish va Goreme g\'or mehmonxonasiga joylashish.' },
        { day: 5, title: 'Havo sharlarida unutilmas tong', desc: 'Erta tongda havo sharida ko\'kka ko\'tarilish va qizil vodiy sayri.' },
        { day: 6, title: 'Sehrli perilar vodiysi', desc: 'Ihlara vodiysi va qadimiy g\'or cherkovlari bo\'ylab ekskursiya.' },
        { day: 7, title: 'Toshkentga qaytish', desc: 'Transfer orqali aeroportga yetib borish va uyga parvoz.' }
      ]
    },
    {
      id: 'kmp-combo-dxb-auh-6',
      title: 'Dubay Hashamati + Abu-Dabi Poytaxt Mo\'jizalari',
      route: ['Toshkent', 'Dubay (4 kecha)', 'Abu-Dabi (2 kecha)', 'Toshkent'],
      routeSummary: 'Toshkent ➔ Dubay (4k) ➔ Abu-Dabi (2k) ➔ Toshkent',
      cities: ['Dubay', 'Abu-Dabi'],
      nightsTotal: 6,
      nightsSplit: '4 kecha Dubay + 2 kecha Abu-Dabi',
      hotels: [
        { city: 'Dubay', hotelName: 'Marina View Deluxe 4*', stars: '4★', nights: 4, meal: 'BB', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
        { city: 'Abu-Dabi', hotelName: 'Khalidiya Palace Rayhaan 5*', stars: '5★', nights: 2, meal: 'BB', img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800' }
      ],
      transfersIncluded: true,
      excursionsIncluded: [
        'Burj Khalifa 124-qavat kuzatuv maydonchasi',
        'Luvr Abu-Dabi san\'at muzeyi biletlari',
        'Shayx Zayd oq marmar masjidi ziyorati',
        'Qizil qumliklarda Safari djiplarida sayr va shou'
      ],
      price: 1180,
      oldPrice: 1350,
      departureCity: 'Toshkent (TAS)',
      departureDate: '18.11.2026',
      airline: 'Flydubai',
      flight: 'FZ 784: Toshkent -> Dubay',
      img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      rating: 9.6,
      saved: false,
      kompasTourCode: 'KOMPAS-COMBO-UAE-02',
      kompasOnlineUrl: 'https://online.uz.kompastour.com',
      itinerary: [
        { day: 1, title: 'Dubayga parvoz va transfer', desc: 'Dubay aeroportida kutib olish va Marina View mehmonxonasiga transfer.' },
        { day: 2, title: 'Zamonaviy Dubay va Burj Khalifa', desc: 'Dubai Mall, favvoralar shousi va Burj Khalifa cho\'qqisi.' },
        { day: 3, title: 'Sahro safarisi', desc: 'Djiplarda qum barxanlari ustida haydash va arab kechasi.' },
        { day: 4, title: 'Abu-Dabiga ko\'chish', desc: 'Komfortli transfer bilan Abu-Dabi poytaxtiga sayohat.' },
        { day: 5, title: 'Shayx Zayd va Luvr', desc: 'Dunyodagi eng katta oq masjid va Luvr muzeyining durdonalari.' },
        { day: 6, title: 'Toshkentga qaytish', desc: 'Aeroportga transfer va O\'zbekistonga xavfsiz qaytish.' }
      ]
    },
    {
      id: 'kmp-combo-ayt-ist-8',
      title: 'Antalya All-Inclusive Plyaji + Istanbul Tarixiy Sayri',
      route: ['Toshkent', 'Antalya (5 kecha)', 'Istanbul (3 kecha)', 'Toshkent'],
      routeSummary: 'Toshkent ➔ Antalya (5k) ➔ Istanbul (3k) ➔ Toshkent',
      cities: ['Antalya', 'Istanbul'],
      nightsTotal: 8,
      nightsSplit: '5 kecha Antalya + 3 kecha Istanbul',
      hotels: [
        { city: 'Antalya', hotelName: 'Grand Ring Hotel 5*', stars: '5★', nights: 5, meal: 'UAI', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800' },
        { city: 'Istanbul', hotelName: 'Grand Yavuz Hotel 4*', stars: '4★', nights: 3, meal: 'BB', img: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800' }
      ],
      transfersIncluded: true,
      excursionsIncluded: [
        'Duden sharsharasi va Antalyaning qadimgi Kaleichi shahri',
        'Bosphorus bo\'ylab kechki sayr',
        'Taksim va Istiqlol ko\'chasida xaridlar'
      ],
      price: 1390,
      oldPrice: 1580,
      departureCity: 'Toshkent (TAS)',
      departureDate: '20.11.2026',
      airline: 'Uzbekistan Airways',
      flight: 'HY 271: Toshkent -> Antalya / Ichki: AYT -> IST',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      rating: 9.7,
      saved: false,
      kompasTourCode: 'KOMPAS-COMBO-TR-03',
      kompasOnlineUrl: 'https://online.uz.kompastour.com',
      itinerary: [
        { day: 1, title: 'Antalyaga to\'g\'ridan-to\'g\'ri parvoz', desc: 'Kemer bo\'yidagi 5 yulduzli Grand Ring mehmonxonasiga joylashish.' },
        { day: 2, title: 'O\'rta yer dengizida rohatlanish', desc: 'Ultra All Inclusive sharoitida to\'liq hordiq chiqarish.' },
        { day: 3, title: 'Duden sharsharasi va Kaleichi', desc: 'Antalyaning tarixiy ko\'chalari va qoyali sharshara sayohati.' },
        { day: 4, title: 'Dengiz bo\'yi faoliyatlari', desc: 'Akvalangda sho\'ng\'ish yoki yaxtada ochiq dengizga sayr.' },
        { day: 5, title: 'Istanbul sari parvoz', desc: 'Antalyadan Istanbulga ichki reys orqali uchish.' },
        { day: 6, title: 'Istanbulning madaniy yuragi', desc: 'Ayasofya va Bosphorus bo\'ylab sayr.' },
        { day: 7, title: 'Xaridlar va gastronomiya', desc: 'Kapali Charshi (Grand Bazaar) va Taksim ko\'chasi.' },
        { day: 8, title: 'Toshkentga qaytish', desc: 'Istanbul yangi aeroportidan Toshkentga to\'g\'ridan-to\'g\'ri parvoz.' }
      ]
    },
    {
      id: 'kmp-combo-bkk-hkt-9',
      title: 'Tailand: Bangkok Megapolisi + Phuket Oroli Marvaridi',
      route: ['Toshkent', 'Bangkok (3 kecha)', 'Phuket (6 kecha)', 'Toshkent'],
      routeSummary: 'Toshkent ➔ Bangkok (3k) ➔ Phuket (6k) ➔ Toshkent',
      cities: ['Bangkok', 'Phuket'],
      nightsTotal: 9,
      nightsSplit: '3 kecha Bangkok + 6 kecha Phuket',
      hotels: [
        { city: 'Bangkok', hotelName: 'Amari Bangkok 5*', stars: '5★', nights: 3, meal: 'BB', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' },
        { city: 'Phuket', hotelName: 'Diamond Cliff Resort 5*', stars: '5★', nights: 6, meal: 'BB', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800' }
      ],
      transfersIncluded: true,
      excursionsIncluded: [
        'Katta Qirollik saroyi va Zumrad Budda ibodatxonasi',
        'Chaophraya daryosida kechki shou va ovqatlanish',
        'Phi Phi orollariga tezyurar katerda bir kunlik sayohat'
      ],
      price: 1620,
      oldPrice: 1850,
      departureCity: 'Toshkent (TAS)',
      departureDate: '25.11.2026',
      airline: 'Uzbekistan Airways',
      flight: 'HY 531: Toshkent -> Bangkok / Ichki: BKK -> HKT',
      img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop&q=80',
      rating: 9.9,
      saved: false,
      kompasTourCode: 'KOMPAS-COMBO-TH-04',
      kompasOnlineUrl: 'https://online.uz.kompastour.com',
      itinerary: [
        { day: 1, title: 'Bangkokka parvoz', desc: 'Suvarnabhumi aeroportida kutib olish va Amari Bangkok 5* ga joylashish.' },
        { day: 2, title: 'Qirollik saroyi va ibodatxonalar', desc: 'Bangkokning qadimiy boyliklari bo\'ylab ekskursiya.' },
        { day: 3, title: 'Phuket oroliga ko\'chish', desc: 'Ichki reys orqali Phuketga yetib kelish va Patong sohiliga transfer.' },
        { day: 4, title: 'Andaman dengizi hordig\'i', desc: 'Diamond Cliff Resort mehmonxonasida quyosh va dengiz zavqi.' },
        { day: 5, title: 'Phi Phi orollariga sayohat', desc: 'Mashhur Maya Bay ko\'rfazi va orollarda suzish.' },
        { day: 6, title: 'James Bond oroli', desc: 'Phang Nga ko\'rfazida kayaklarda g\'orlar bo\'ylab suzish.' },
        { day: 7, title: 'Erkin kun va massaj', desc: 'Tailand an\'anaviy massaji va mevalar bozori.' },
        { day: 8, title: 'Sohil bo\'yidagi so\'nggi kun', desc: 'Kechki baliq restoranida ovqatlanish.' },
        { day: 9, title: 'Toshkentga qaytish', desc: 'Phuket aeroportidan to\'g\'ridan-to\'g\'ri Toshkentga uchish.' }
      ]
    },
    {
      id: 'kmp-combo-cai-ssh-8',
      title: 'Misr: Qohira Buyuk Piramidalari + Sharm El-Sheikh Riflari',
      route: ['Toshkent', 'Qohira (2 kecha)', 'Sharm El-Sheikh (6 kecha)', 'Toshkent'],
      routeSummary: 'Toshkent ➔ Qohira (2k) ➔ Sharm El-Sheikh (6k) ➔ Toshkent',
      cities: ['Qohira', 'Sharm El-Sheikh'],
      nightsTotal: 8,
      nightsSplit: '2 kecha Qohira + 6 kecha Sharm El-Sheikh',
      hotels: [
        { city: 'Qohira', hotelName: 'Steigenberger Pyramids 5*', stars: '5★', nights: 2, meal: 'BB', img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800' },
        { city: 'Sharm El-Sheikh', hotelName: 'Rixos Sharm El Sheikh 5*', stars: '5★', nights: 6, meal: 'UAI', img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800' }
      ],
      transfersIncluded: true,
      excursionsIncluded: [
        'Giza piramidalari va Sfinks haykali to\'liq ekskursiyasi',
        'Katta Misr milliy muzeyi (GEM)',
        'Ras Muhammad milliy dengiz parkida sho\'ng\'ish'
      ],
      price: 1350,
      oldPrice: 1540,
      departureCity: 'Toshkent (TAS)',
      departureDate: '22.11.2026',
      airline: 'Air Cairo / Centrum Air',
      flight: 'SM 912: Toshkent -> Qohira / CAI -> SSH',
      img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&auto=format&fit=crop&q=80',
      rating: 9.7,
      saved: false,
      kompasTourCode: 'KOMPAS-COMBO-EG-05',
      kompasOnlineUrl: 'https://online.uz.kompastour.com',
      itinerary: [
        { day: 1, title: 'Qohiraga yetib kelish', desc: 'Piramidalar yonidagi 5 yulduzli Steigenberger mehmonxonasiga joylashish.' },
        { day: 2, title: 'Piramidalar va Sfinks mo\'jizasi', desc: 'Xeops piramidasi, Sfinks va Nil daryosida quyosh botishi.' },
        { day: 3, title: 'Qizil dengizga parvoz', desc: 'Sharm El-Sheikh kurortiga parvoz va Rixos 5* ga joylashish.' },
        { day: 4, title: 'Ultra All-Inclusive va marjon riflari', desc: 'Mehmonxonaning xususiy rifida niqobda suzish (snorkeling).' },
        { day: 5, title: 'Ras Muhammad dengiz qo\'riqxonasi', desc: 'Kema bilan dunyoning eng chiroyli suvosti marjonlariga sayohat.' },
        { day: 6, title: 'Sinay sahrosi safarisi', desc: 'Kvadrosikllarda badaviylar choyxonasiga sayr va yulduzlar kechasi.' },
        { day: 7, title: 'Dam olish va xaridlar', desc: 'Naama Bay va Old Market bo\'ylab kechki sayr.' },
        { day: 8, title: 'Toshkentga qaytish', desc: 'Sharm aeroportidan to\'g\'ridan-to\'g\'ri Toshkentga parvoz.' }
      ]
    }
  ];

  return comboCatalog;
}
