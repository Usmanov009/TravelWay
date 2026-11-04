import { Router } from 'express';
import { CatalogItemModel, getDBStatus } from '../../../db.js';

export const comboRouter = Router();
export const flightsRouter = Router();
export const hotelsRouter = Router();

function requireDatabase(res: { status: (code: number) => any; json: (body: unknown) => any }) {
  if (!getDBStatus().connected) {
    res.status(503).json({
      success: false,
      error: 'MongoDB bilan aloqa yo‘q. Katalog ma’lumotlari mavjud emas.',
    });
    return false;
  }
  return true;
}

async function loadCatalog(kind: 'combo-tours' | 'flights' | 'hotels') {
  const entries = await CatalogItemModel.find({ kind }).sort({ createdAt: -1 }).lean();
  return entries.map((entry) => entry.data as Record<string, any>);
}

function matches(value: unknown, query: string) {
  return String(value || '').toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

comboRouter.get('/tours', async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const query = String(req.query.q || '').trim();
    const city = String(req.query.city || '');
    let results = await loadCatalog('combo-tours');
    if (query) {
      results = results.filter((item) =>
        matches(item.title, query) ||
        item.cities?.some((name: string) => matches(name, query)) ||
        matches(item.routeSummary, query),
      );
    }
    if (city && city !== 'Barchasi') {
      results = results.filter((item) =>
        item.cities?.some((name: string) => matches(name, city)),
      );
    }
    return res.json({ success: true, source: 'MongoDB', count: results.length, comboTours: results });
  } catch (error) {
    console.error('Combo catalog query failed:', error);
    return res.status(500).json({ success: false, error: 'Combo turlar bazasini o‘qib bo‘lmadi.' });
  }
});

flightsRouter.get('/search', async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const from = String(req.query.from || '');
    const to = String(req.query.to || '');
    const airline = String(req.query.airline || '');
    const directOnly = req.query.directOnly === 'true';
    let results = await loadCatalog('flights');
    if (from) {
      results = results.filter((item) =>
        matches(item.departureCity, from) || matches(item.departureAirportCode, from),
      );
    }
    if (to) {
      results = results.filter((item) =>
        matches(item.arrivalCity, to) || matches(item.arrivalAirportCode, to),
      );
    }
    if (airline && airline !== 'Barcha aviakompaniyalar') {
      results = results.filter((item) => matches(item.airline, airline));
    }
    if (directOnly) results = results.filter((item) => item.flightType === 'direct');
    return res.json({ success: true, source: 'MongoDB', count: results.length, flights: results });
  } catch (error) {
    console.error('Flight catalog query failed:', error);
    return res.status(500).json({ success: false, error: 'Aviabiletlar bazasini o‘qib bo‘lmadi.' });
  }
});

hotelsRouter.get('/search', async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const country = String(req.query.country || '');
    const resort = String(req.query.resort || '');
    const meal = String(req.query.meal || '');
    const query = String(req.query.q || '');
    let results = await loadCatalog('hotels');
    if (country && country !== 'Barchasi') {
      results = results.filter((item) => matches(item.country, country));
    }
    if (resort && resort !== 'Barcha kurortlar') {
      results = results.filter((item) => matches(item.resort, resort));
    }
    if (meal && meal !== 'ALL') results = results.filter((item) => item.mealType === meal);
    if (query) {
      results = results.filter((item) => matches(item.name, query) || matches(item.resort, query));
    }
    return res.json({ success: true, source: 'MongoDB', count: results.length, hotels: results });
  } catch (error) {
    console.error('Hotel catalog query failed:', error);
    return res.status(500).json({ success: false, error: 'Mehmonxonalar bazasini o‘qib bo‘lmadi.' });
  }
});
