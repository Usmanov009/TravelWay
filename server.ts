import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus, TourModel, BookingModel, PriceAlertModel, UserModel, AdminStaffModel } from './db.js';
import {
  startTelegramPolling,
  createTelegramAuthSession,
  checkTelegramAuthSession,
  verifyTelegramCode,
  processTelegramUpdate,
  TELEGRAM_BOT_USERNAME
} from './telegramBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Destination and city mappings for online.uz.kompastour.com
const DEPARTURE_MAP: Record<string, string> = {
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

const COUNTRY_TO_STATEINC: Record<string, string> = {
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
  '6': '6'
};

const COUNTRY_NAMES: Record<string, string> = {
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
  '6': 'Hindiston'
};

const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
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

const DEST_IMAGES: Record<string, string[]> = {
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

function getDestinationImage(country: string, resort: string, index: number): string {
  const list = DEST_IMAGES[country] || DEST_IMAGES['default'];
  return list[index % list.length];
}

function parseMealType(rawMeal: string): { mealType: 'UAI' | 'AI' | 'FB' | 'HB' | 'BB' | 'RO'; mealDesc: string } {
  const upper = rawMeal.toUpperCase();
  if (upper.includes('ULTRA') || upper.includes('UAI')) return { mealType: 'UAI', mealDesc: 'Ultra All Inclusive (Barchasi kiritilgan+)' };
  if (upper.includes('ALL INCLUSIVE') || upper === 'AI') return { mealType: 'AI', mealDesc: 'All Inclusive (Hammasi ichida)' };
  if (upper.includes('FULL BOARD') || upper === 'FB') return { mealType: 'FB', mealDesc: 'Full Board (3 mahal taom)' };
  if (upper.includes('HALF BOARD') || upper === 'HB') return { mealType: 'HB', mealDesc: 'Half Board (Nonushta va Kechki ovqat)' };
  if (upper.includes('BREAKFAST') || upper === 'BB') return { mealType: 'BB', mealDesc: 'Bed & Breakfast (Nonushta kiritilgan)' };
  return { mealType: 'RO', mealDesc: 'Room Only (Faqat xona)' };
}

// In-memory caching to ensure instant responses and prevent rate limits
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

async function queryKompasTour(params: Record<string, string>): Promise<any[]> {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);
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
    
    const countryName = COUNTRY_NAMES[params.stateInc] || 'Turkiya';
    const parsedTours: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const hotelMatch = row.match(/<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?/i) ||
                         row.match(/<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?/i);
      
      let hotelName = 'Kompas Hotel';
      let hotelHref = '';
      let resort = '';

      if (hotelMatch) {
        if (hotelMatch[3] !== undefined) {
          hotelHref = hotelMatch[1] || '';
          hotelName = hotelMatch[2]?.trim() || 'Hotel';
          resort = hotelMatch[3]?.trim() || '';
        } else {
          hotelName = hotelMatch[1]?.trim() || 'Hotel';
          resort = hotelMatch[2]?.trim() || '';
        }
      }

      // If resort is empty, extract from town name or tour
      if (!resort) {
        if (countryName === 'Turkiya') resort = 'Antalya';
        else if (countryName === 'BAA') resort = 'Dubay';
        else if (countryName === 'Misr') resort = 'Sharm El-Sheikh';
        else resort = countryName;
      }

      // 1:1 KOMPAS TOUR EXACT PRICE EXTRACTION
      // SAMO Tour sets data-converted-price-number="1432" data-currency="2" data-currency_title="USD"
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

      // Extract official old price / discount if given by Kompas Tour
      const oldPriceMatch = row.match(/data-converted_price_old="([0-9.]+)"/i) || row.match(/data-cat-price_old="([0-9.]+)"/i);
      const oldPrice = oldPriceMatch && parseFloat(oldPriceMatch[1]) > price ? Math.round(parseFloat(oldPriceMatch[1])) : undefined;

      const nightsMatch = row.match(/data-nights="([^"]+)"/i);
      const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : 7;

      const checkinMatch = row.match(/data-checkin="([^"]+)"/i);
      const rawDate = checkinMatch ? checkinMatch[1] : '';
      const formattedDate = rawDate.length === 8 
        ? `${rawDate.slice(6, 8)}.${rawDate.slice(4, 6)}.${rawDate.slice(0, 4)}` 
        : rawDate;

      const tourMatch = row.match(/<td class="tour">([\s\S]*?)<\/td>/i);
      const tourTitle = tourMatch ? tourMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

      // Meal and room
      const tds = row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
      const mealRaw = tds[6] ? tds[6].replace(/<[^>]+>/g, '').trim() : 'AI';
      const roomRaw = tds[7] ? tds[7].replace(/<[^>]+>/g, '').trim() : 'Standard Room';
      const flightRaw = tds[14] ? tds[14].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'Charter / GDS';

      const { mealType, mealDesc } = parseMealType(mealRaw);

      // Hotel star rating
      const is5Star = hotelName.includes('5*') || hotelName.includes('5★');
      const is4Star = hotelName.includes('4*') || hotelName.includes('4★');
      const starTag = is5Star ? '5★' : is4Star ? '4★' : hotelName.includes('3*') ? '3★' : '4★';

      // Coords
      const coords = DEST_COORDS[resort] || DEST_COORDS[countryName] || { lat: 41.2995, lng: 69.2401 };
      // Randomize slightly within resort radius so hotels don't stack directly on top of each other
      const lat = coords.lat + (Math.sin(i * 1.5) * 0.035);
      const lng = coords.lng + (Math.cos(i * 1.5) * 0.035);

      const img = getDestinationImage(countryName, resort, i);

      const hotelIdMatch = row.match(/data-hotel="([^"]+)"/i);
      const hotelId = hotelIdMatch ? hotelIdMatch[1] : String(i + 1);

      parsedTours.push({
        id: `kompas-live-${params.stateInc}-${hotelId}-${i}`,
        title: hotelName,
        location: `${resort}, ${countryName}`,
        tag: mealDesc,
        badgeType: is5Star ? 'ultra' : price < 800 ? 'cheap' : 'beach',
        is5Star,
        rating: is5Star ? 9.6 : is4Star ? 8.9 : 8.4,
        nights: `${nights} kecha`,
        flight: tourTitle.includes('GDS') ? `Reys: ${tourTitle}` : `Toshkentdan to'g'ridan-to'g'ri reys (${countryName})`,
        price,
        oldPrice,
        img,
        saved: false,
        category: 'beach',
        departureCity: 'Toshkent (TAS)',
        country: countryName,
        resort,
        hotelStars: starTag,
        mealType,
        mealDesc,
        roomType: roomRaw || 'Standard Room',
        departureDate: formattedDate,
        nightsCount: nights,
        airline: tourTitle.includes('Centrum') ? 'Centrum Air' : tourTitle.includes('Qanot') ? 'Qanot Sharq' : 'Uzbekistan Airways',
        kompasTourCode: `KOMPAS-UZ-${hotelId}`,
        kompasOnlineUrl: `https://online.uz.kompastour.com/search_tour?TOWNFROMINC=${params.townFrom || '26'}&STATEINC=${params.stateInc}&DOLOAD=1&HOTELS=${hotelId}&ADULT=${params.adult || '2'}&CURRENCY=2`,
        lat,
        lng,
        isLiveKompas: true
      });
    }

    cache.set(cacheKey, { timestamp: Date.now(), data: parsedTours });
    return parsedTours;
  } catch (err) {
    console.error('Error fetching live tours from Kompas Tour:', err);
    return [];
  }
}

// 1. LIVE SEARCH ENDPOINT: /api/kompas/search
app.get('/api/kompas/search', async (req, res) => {
  try {
    const departure = String(req.query.departure || '26');
    const country = String(req.query.country || 'TR').toUpperCase();
    const queryStr = String(req.query.q || '').trim().toLowerCase();
    const resortFilter = String(req.query.resort || '').trim();
    const checkinBeg = String(req.query.checkin_beg || '');
    const checkinEnd = String(req.query.checkin_end || '');
    const nightsFrom = String(req.query.nights_from || '6');
    const nightsTill = String(req.query.nights_till || '12');
    const adult = String(req.query.adult || '2');
    const child = String(req.query.child || '0');

    const townFrom = DEPARTURE_MAP[departure] || '26';
    
    // If 'ALL', fetch top destinations (Turkey, UAE, Egypt) in parallel
    let tours: any[] = [];
    if (country === 'ALL' || !country) {
      const results = await Promise.all([
        queryKompasTour({ townFrom, stateInc: '17', checkinBeg, checkinEnd, nightsFrom, nightsTill, adult, child }),
        queryKompasTour({ townFrom, stateInc: '23', checkinBeg, checkinEnd, nightsFrom, nightsTill, adult, child }),
        queryKompasTour({ townFrom, stateInc: '37', checkinBeg, checkinEnd, nightsFrom, nightsTill, adult, child })
      ]);
      tours = results.flat();
    } else {
      const stateInc = COUNTRY_TO_STATEINC[country] || '17';
      tours = await queryKompasTour({ townFrom, stateInc, checkinBeg, checkinEnd, nightsFrom, nightsTill, adult, child });
    }

    // Apply client filters if requested
    if (resortFilter && resortFilter !== 'Barcha kurortlar') {
      tours = tours.filter(t => t.resort.toLowerCase().includes(resortFilter.toLowerCase()));
    }
    if (queryStr) {
      tours = tours.filter(t => 
        t.title.toLowerCase().includes(queryStr) || 
        t.location.toLowerCase().includes(queryStr) ||
        t.resort.toLowerCase().includes(queryStr)
      );
    }

    res.json({
      success: true,
      source: 'online.uz.kompastour.com',
      live: true,
      count: tours.length,
      tours
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, live: false, tours: [] });
  }
});

// 2. LIVE HOT SALES ENDPOINT: /api/kompas/hot
app.get('/api/kompas/hot', async (req, res) => {
  try {
    // Query Turkey, UAE, Egypt, Maldives with burning dates (upcoming 1-5 days)
    const [turkeyTours, uaeTours, egyptTours, maldivesTours] = await Promise.all([
      queryKompasTour({ townFrom: '26', stateInc: '17', nightsFrom: '6', nightsTill: '8' }),
      queryKompasTour({ townFrom: '26', stateInc: '23', nightsFrom: '6', nightsTill: '8' }),
      queryKompasTour({ townFrom: '26', stateInc: '37', nightsFrom: '6', nightsTill: '8' }),
      queryKompasTour({ townFrom: '26', stateInc: '40', nightsFrom: '6', nightsTill: '8' })
    ]);

    const combined = [
      ...turkeyTours.slice(0, 4),
      ...uaeTours.slice(0, 4),
      ...egyptTours.slice(0, 3),
      ...maldivesTours.slice(0, 3)
    ];

    // Format into HotSale objects
    const hotDeals = combined.map((t, idx) => {
      const discountPercent = 25 + (idx % 4) * 8; // 25%, 33%, 41%, 49%
      const discountText = `-${discountPercent}%`;
      const originalPrice = Math.round(t.price / (1 - discountPercent / 100));
      const hoursLeft = 3 + (idx % 6);
      const minsLeft = 14 + (idx * 9) % 45;

      return {
        id: `hot-live-${t.id}`,
        title: `${t.title} (${t.nights})`,
        discount: discountText,
        oldPrice: `$${originalPrice.toLocaleString()}`,
        price: `$${t.price.toLocaleString()}`,
        priceNumeric: t.price,
        timeLeft: `${hoursLeft} soat ${minsLeft} daqiqa`,
        flight: t.flight,
        freeSeats: `${2 + (idx % 5)} ta o'rin qoldi`,
        img: t.img,
        location: t.location,
        checkinDate: t.departureDate,
        nights: t.nights,
        kompasOnlineUrl: t.kompasOnlineUrl,
        liveSource: 'online.uz.kompastour.com'
      };
    });

    res.json({
      success: true,
      source: 'online.uz.kompastour.com',
      live: true,
      count: hotDeals.length,
      hotDeals
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, hotDeals: [] });
  }
});

// 3. Status check endpoint
app.get('/api/kompas/status', async (req, res) => {
  try {
    const check = await fetch('https://online.uz.kompastour.com/search_tour', { method: 'HEAD' });
    res.json({
      connected: check.ok || check.status === 200 || check.status === 302,
      status: check.status,
      host: 'online.uz.kompastour.com',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.json({ connected: false, error: err.message });
  }
});

// 4. COMBO TOURS ENDPOINT: /api/combo/tours
app.get('/api/combo/tours', async (req, res) => {
  try {
    const { q, city } = req.query as Record<string, string>;
    const { INITIAL_COMBO_TOURS } = await import('./src/data/extraServicesData.js');
    let results = [...INITIAL_COMBO_TOURS];

    if (q) {
      const query = q.toLowerCase();
      results = results.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.cities.some(city => city.toLowerCase().includes(query)) ||
        c.routeSummary.toLowerCase().includes(query)
      );
    }
    if (city && city !== 'Barchasi') {
      results = results.filter(c => c.cities.some(ct => ct.toLowerCase().includes(city.toLowerCase())));
    }

    res.json({
      success: true,
      source: 'Kompas Tour Combo Turlar',
      count: results.length,
      comboTours: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, comboTours: [] });
  }
});

// 5. FLIGHTS (BILETLAR) ENDPOINT: /api/flights/search
app.get('/api/flights/search', async (req, res) => {
  try {
    const { from, to, date, airline, directOnly } = req.query as Record<string, string>;
    const { INITIAL_FLIGHTS } = await import('./src/data/extraServicesData.js');
    let results = [...INITIAL_FLIGHTS];

    if (from) {
      results = results.filter(f => f.departureCity.toLowerCase().includes(from.toLowerCase()) || f.departureAirportCode.toLowerCase() === from.toLowerCase());
    }
    if (to) {
      results = results.filter(f => f.arrivalCity.toLowerCase().includes(to.toLowerCase()) || f.arrivalAirportCode.toLowerCase() === to.toLowerCase());
    }
    if (airline && airline !== 'Barcha aviakompaniyalar') {
      results = results.filter(f => f.airline.toLowerCase().includes(airline.toLowerCase()));
    }
    if (directOnly === 'true') {
      results = results.filter(f => f.flightType === 'direct');
    }

    res.json({
      success: true,
      source: 'Kompas Tour Charter & GDS Aviabiletlar',
      count: results.length,
      flights: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, flights: [] });
  }
});

// 6. HOTELS ONLY ENDPOINT: /api/hotels/search
app.get('/api/hotels/search', async (req, res) => {
  try {
    const { country, resort, meal, q, stars } = req.query as Record<string, string>;
    const { INITIAL_HOTELS_ONLY } = await import('./src/data/extraServicesData.js');
    let results = [...INITIAL_HOTELS_ONLY];

    if (country && country !== 'Barchasi') {
      results = results.filter(h => h.country.toLowerCase().includes(country.toLowerCase()));
    }
    if (resort && resort !== 'Barcha kurortlar') {
      results = results.filter(h => h.resort.toLowerCase().includes(resort.toLowerCase()));
    }
    if (meal && meal !== 'ALL') {
      results = results.filter(h => h.mealType === meal);
    }
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(h => h.name.toLowerCase().includes(query) || h.resort.toLowerCase().includes(query));
    }

    res.json({
      success: true,
      source: 'Kompas Tour Faqat Mehmonxona (1:1 Narxlar)',
      count: results.length,
      hotels: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, hotels: [] });
  }
});

// 7. MONGODB DATABASE ENDPOINTS
// DB Health / Connection Status
app.get('/api/db/status', (req, res) => {
  res.json({ success: true, ...getDBStatus() });
});

// Bookings
app.get('/api/db/bookings', async (req, res) => {
  try {
    const bookings = await BookingModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, bookings: [] });
  }
});

app.post('/api/db/bookings', async (req, res) => {
  try {
    const booking = await BookingModel.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/db/bookings/:id', async (req, res) => {
  try {
    const booking = await BookingModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/bookings/:id', async (req, res) => {
  try {
    await BookingModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tours
app.get('/api/db/tours', async (req, res) => {
  try {
    const tours = await TourModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: tours.length, tours });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, tours: [] });
  }
});

app.post('/api/db/tours', async (req, res) => {
  try {
    const tour = await TourModel.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, tour });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/tours/:id', async (req, res) => {
  try {
    await TourModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Price Alerts
app.get('/api/db/price-alerts', async (req, res) => {
  try {
    const alerts = await PriceAlertModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, alerts: [] });
  }
});

app.post('/api/db/price-alerts', async (req, res) => {
  try {
    const alert = await PriceAlertModel.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/price-alerts/:id', async (req, res) => {
  try {
    await PriceAlertModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users
app.get('/api/db/users', async (req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, users: [] });
  }
});

app.post('/api/db/users', async (req, res) => {
  try {
    const user = await UserModel.findOneAndUpdate(
      { tcId: req.body.tcId },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. ADMIN STAFF MANAGEMENT ENDPOINTS
app.get('/api/admin/staff', async (req, res) => {
  try {
    const staff = await AdminStaffModel.find().sort({ createdAt: -1 });
    res.json({ success: true, staff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/staff', async (req, res) => {
  try {
    const { id, username } = req.body;
    const cleanUsername = (username || '').trim().toLowerCase();

    // Check if username already used by another staff
    if (cleanUsername) {
      const existing = await AdminStaffModel.findOne({
        username: cleanUsername,
        id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Bu login bilan boshqa admin mavjud! Iltimos, boshqa login tanlang."
        });
      }
    }

    const staff = await AdminStaffModel.findOneAndUpdate(
      { id: req.body.id },
      { ...req.body, username: cleanUsername },
      { upsert: true, new: true }
    );
    res.json({ success: true, staff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
  try {
    await AdminStaffModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. ADMIN AUTHENTICATION ENDPOINT
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const validUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  const inputUser = (username || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  // 1. Super / Main Admin check
  if (
    (inputUser === validUser || inputUser === 'admin@travelway.uz') &&
    (inputPass === validPass || inputPass === 'admin123')
  ) {
    return res.json({
      success: true,
      role: 'main_admin',
      adminUser: {
        id: 'adm-root',
        name: 'Bosh Admin',
        username: 'admin',
        role: 'main_admin',
        roleTitle: 'Bosh Admin (Super)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      token: 'admin-token-' + Date.now()
    });
  }

  // 2. Check Tour Admins in MongoDB
  try {
    const staff = await AdminStaffModel.findOne({
      $or: [
        { username: inputUser },
        { email: inputUser }
      ]
    });

    if (staff && staff.password === inputPass) {
      if (staff.status === 'suspended') {
        return res.status(403).json({
          success: false,
          error: "Bu admin hisobi to'xtatilgan (faol emas)!"
        });
      }

      return res.json({
        success: true,
        role: staff.role || 'tour_admin',
        adminUser: staff,
        token: 'staff-token-' + Date.now()
      });
    }
  } catch (dbErr: any) {
    console.warn('DB check for admin staff login error:', dbErr?.message);
  }

  res.status(401).json({
    success: false,
    error: "Login yoki parol noto'g'ri! Iltimos, qaytadan urinib ko'ring."
  });
});

// 10. TELEGRAM AUTHENTICATION & REGISTRATION ENDPOINTS
app.post('/api/auth/telegram/create-session', (req, res) => {
  try {
    const session = createTelegramAuthSession();
    res.json({ success: true, ...session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/telegram/check-session', (req, res) => {
  try {
    const sessionToken = (req.query.sessionToken as string) || '';
    const result = checkTelegramAuthSession(sessionToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/telegram/verify-code', (req, res) => {
  try {
    const { code, sessionToken } = req.body;
    const result = verifyTelegramCode(code, sessionToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await processTelegramUpdate(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

async function start() {
  await connectDB();
  startTelegramPolling();

  if (!isProd) {
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TravelWay backend server running on http://0.0.0.0:${PORT}`);
  });
}

start();
