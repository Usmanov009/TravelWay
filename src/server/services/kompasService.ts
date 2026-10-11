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
  '6': '6'
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
  '6': 'Hindiston'
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
    
    const countryName = COUNTRY_NAMES[params.stateInc] || 'Turkiya';
    const parsedTours: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const hotelMatch = row.match(/<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?/i) ||
                         row.match(/<td[^>]*class="link-hotel"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>\s*(?:\(([^)]+)\))?/i);
      
      let hotelName = 'Resort Hotel';
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

      if (!resort) {
        if (countryName === 'Turkiya') resort = 'Antalya';
        else if (countryName === 'BAA') resort = 'Dubay';
        else if (countryName === 'Misr') resort = 'Sharm El-Sheikh';
        else resort = countryName;
      }

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
      const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : 7;

      const checkinMatch = row.match(/data-checkin="([^"]+)"/i);
      const rawDate = checkinMatch ? checkinMatch[1] : '';
      const formattedDate = rawDate.length === 8 
        ? `${rawDate.slice(6, 8)}.${rawDate.slice(4, 6)}.${rawDate.slice(0, 4)}` 
        : rawDate;

      const tourMatch = row.match(/<td class="tour">([\s\S]*?)<\/td>/i);
      const tourTitle = tourMatch ? tourMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

      const tds = row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
      const mealRaw = tds[6] ? tds[6].replace(/<[^>]+>/g, '').trim() : 'AI';
      const roomRaw = tds[7] ? tds[7].replace(/<[^>]+>/g, '').trim() : 'Standard Room';

      const { mealType, mealDesc } = parseMealType(mealRaw);

      const is5Star = hotelName.includes('5*') || hotelName.includes('5★');
      const is4Star = hotelName.includes('4*') || hotelName.includes('4★');
      const starTag = is5Star ? '5★' : is4Star ? '4★' : hotelName.includes('3*') ? '3★' : '4★';

      const coords = DEST_COORDS[resort] || DEST_COORDS[countryName] || { lat: 41.2995, lng: 69.2401 };
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

    kompasCache.set(cacheKey, { timestamp: Date.now(), data: parsedTours });
    return parsedTours;
  } catch (err) {
    console.error('Error fetching live tours from Kompas Tour:', err);
    return [];
  }
}
