import { describe, it, expect } from 'vitest';
import { 
  parseMealType, 
  DEPARTURE_MAP, 
  COUNTRY_TO_STATEINC, 
  COUNTRY_NAMES,
  getDestinationImage,
  kompasCache,
  CACHE_TTL_MS
} from '../src/server/services/kompasService.js';

describe('Kompas Tour Service & Scraper Logic', () => {
  describe('Meal Type Parsing', () => {
    it('should correctly identify Ultra All Inclusive (UAI)', () => {
      const res1 = parseMealType('Ultra All Inclusive');
      expect(res1.mealType).toBe('UAI');
      expect(res1.mealDesc).toContain('Ultra All Inclusive');

      const res2 = parseMealType('UAI');
      expect(res2.mealType).toBe('UAI');
    });

    it('should correctly identify All Inclusive (AI)', () => {
      const res = parseMealType('All Inclusive');
      expect(res.mealType).toBe('AI');
      expect(res.mealDesc).toContain('Hammasi ichida');
    });

    it('should correctly identify Full Board (FB)', () => {
      const res = parseMealType('FB');
      expect(res.mealType).toBe('FB');
      expect(res.mealDesc).toContain('3 mahal taom');
    });

    it('should correctly identify Half Board (HB)', () => {
      const res = parseMealType('HB');
      expect(res.mealType).toBe('HB');
      expect(res.mealDesc).toContain('Nonushta va Kechki ovqat');
    });

    it('should correctly identify Bed & Breakfast (BB)', () => {
      const res = parseMealType('BB');
      expect(res.mealType).toBe('BB');
      expect(res.mealDesc).toContain('Nonushta kiritilgan');
    });

    it('should fallback to Room Only (RO) for unmapped meal types', () => {
      const res = parseMealType('');
      expect(res.mealType).toBe('RO');
      expect(res.mealDesc).toContain('Faqat xona');
    });
  });

  describe('Destination and City Mappings', () => {
    it('should map Tashkent, Samarkand, and Bukhara correctly', () => {
      expect(DEPARTURE_MAP['Toshkent']).toBe('26');
      expect(DEPARTURE_MAP['Toshkent (TAS)']).toBe('26');
      expect(DEPARTURE_MAP['Samarqand']).toBe('917');
      expect(DEPARTURE_MAP['Buxoro']).toBe('913');
    });

    it('should map major destination countries to correct Kompas Tour state IDs', () => {
      expect(COUNTRY_TO_STATEINC['TR']).toBe('17'); // Turkey
      expect(COUNTRY_TO_STATEINC['EG']).toBe('37'); // Egypt
      expect(COUNTRY_TO_STATEINC['AE']).toBe('23'); // UAE
      expect(COUNTRY_TO_STATEINC['MV']).toBe('40'); // Maldives
      expect(COUNTRY_TO_STATEINC['TH']).toBe('28'); // Thailand
    });

    it('should translate state IDs back to friendly country names', () => {
      expect(COUNTRY_NAMES['17']).toBe('Turkiya');
      expect(COUNTRY_NAMES['37']).toBe('Misr');
      expect(COUNTRY_NAMES['23']).toBe('BAA');
      expect(COUNTRY_NAMES['40']).toBe('Maldiv');
    });
  });

  describe('Image & Caching Utilities', () => {
    it('should return valid destination image url', () => {
      const img = getDestinationImage('Turkiya', 'Antalya', 0);
      expect(img).toBeDefined();
      expect(img.startsWith('http')).toBe(true);
    });

    it('should respect cache TTL settings', () => {
      expect(CACHE_TTL_MS).toBe(3 * 60 * 1000);
      kompasCache.set('test-key', { timestamp: Date.now(), data: [{ test: 1 }] });
      expect(kompasCache.has('test-key')).toBe(true);
      kompasCache.delete('test-key');
    });
  });
});
