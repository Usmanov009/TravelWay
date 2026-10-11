import { Router } from 'express';
import { INITIAL_COMBO_TOURS, INITIAL_FLIGHTS, INITIAL_HOTELS_ONLY } from '../../data/extraServicesData.js';

export const comboRouter = Router();
export const flightsRouter = Router();
export const hotelsRouter = Router();

// COMBO TOURS: /api/combo/tours
comboRouter.get('/tours', (req, res) => {
  try {
    const { q, city } = req.query as Record<string, string>;
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
      source: 'Combo Turlar (1:1 Rasmiy)',
      count: results.length,
      comboTours: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, comboTours: [] });
  }
});

// FLIGHTS: /api/flights/search
flightsRouter.get('/search', (req, res) => {
  try {
    const { from, to, airline, directOnly } = req.query as Record<string, string>;
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
      source: 'Charter & GDS Aviabiletlar',
      count: results.length,
      flights: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, flights: [] });
  }
});

// HOTELS ONLY: /api/hotels/search
hotelsRouter.get('/search', (req, res) => {
  try {
    const { country, resort, meal, q } = req.query as Record<string, string>;
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
      source: 'Faqat Mehmonxona (1:1 Narxlar)',
      count: results.length,
      hotels: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, hotels: [] });
  }
});
