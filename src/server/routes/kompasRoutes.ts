import { Router } from 'express';
import { queryKompasTour, DEPARTURE_MAP, COUNTRY_TO_STATEINC } from '../services/kompasService.js';

const router = Router();

// 1. LIVE SEARCH: /api/kompas/search
router.get('/search', async (req, res) => {
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

// 2. LIVE HOT DEALS: /api/kompas/hot
router.get('/hot', async (req, res) => {
  try {
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

    const hotDeals = combined.map((tour) => {
      const discountPercent = tour.oldPrice && tour.oldPrice > tour.price
        ? Math.round(((tour.oldPrice - tour.price) / tour.oldPrice) * 100)
        : undefined;
      return {
        id: `hot-live-${tour.id}`,
        title: `${tour.title}${tour.nights ? ` (${tour.nights})` : ''}`,
        ...(discountPercent ? { discount: `-${discountPercent}%` } : {}),
        ...(tour.oldPrice ? { oldPrice: `$${tour.oldPrice.toLocaleString()}` } : {}),
        price: `$${tour.price.toLocaleString()}`,
        priceNumeric: tour.price,
        flight: tour.flight || undefined,
        img: tour.img,
        location: tour.location,
        checkinDate: tour.departureDate || undefined,
        nights: tour.nights || undefined,
        kompasOnlineUrl: tour.kompasOnlineUrl,
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

// STATUS CHECK: /api/kompas/status
router.get('/status', async (req, res) => {
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

export default router;
