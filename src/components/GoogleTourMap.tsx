import React, { useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import { TourPackage } from '../types';

export const DESTINATION_COORDINATES: Record<string, { lat: number; lng: number; beachDistance?: string; airportDistance?: string }> = {
  'kmp-ayt-01': { lat: 36.8486, lng: 31.0967, beachDistance: "0 metr (Birinchi qatorda)", airportDistance: "35 km (AYT)" },
  'kmp-ayt-02': { lat: 36.8576, lng: 30.8841, beachDistance: "0 metr (Xususiy plyaj)", airportDistance: "12 km (AYT)" },
  'kmp-ayt-03': { lat: 36.6083, lng: 30.5601, beachDistance: "50 metr", airportDistance: "55 km (AYT)" },
  'kmp-ayt-04': { lat: 36.5781, lng: 31.8596, beachDistance: "0 metr (To'g'ridan-to'g'ri dengiz)", airportDistance: "60 km (GZP)" },
  'kmp-ayt-05': { lat: 36.5684, lng: 30.5843, beachDistance: "Xususiy ko'rfaz va marjon qumlar", airportDistance: "60 km (AYT)" },
  'kmp-ayt-06': { lat: 37.1517, lng: 27.5255, beachDistance: "Egey dengizi sohilida", airportDistance: "15 km (BJV)" },
  'kmp-ayt-07': { lat: 41.0409, lng: 29.0006, beachDistance: "Bosfor bo'g'ozi manzarasi", airportDistance: "38 km (IST)" },
  'kmp-dxb-01': { lat: 25.1304, lng: 55.1171, beachDistance: "0 metr (Palm Jumeirah sohil)", airportDistance: "37 km (DXB)" },
  'kmp-dxb-02': { lat: 25.0784, lng: 55.1332, beachDistance: "Marina JBR plyaji 50m", airportDistance: "33 km (DXB)" },
  'kmp-ssh-01': { lat: 27.8597, lng: 34.3015, beachDistance: "Qizil dengiz marjon riflari 0m", airportDistance: "18 km (SSH)" },
  'kmp-ssh-02': { lat: 27.9333, lng: 34.3944, beachDistance: "Sharks Bay xususiy plyaj 0m", airportDistance: "10 km (SSH)" },
  'kmp-hrg-01': { lat: 27.1648, lng: 33.8242, beachDistance: "Xususiy qumli sohil 0m", airportDistance: "6 km (HRG)" },
  'kmp-hkt-01': { lat: 7.9056, lng: 98.2974, beachDistance: "Patong Beach 120m", airportDistance: "38 km (HKT)" },
  'kmp-mle-01': { lat: 5.7533, lng: 73.3150, beachDistance: "Okean ustidagi villa / Atoll 0m", airportDistance: "45 daqiqa gidrosamolet (MLE)" },
  'kmp-nha-01': { lat: 12.2177, lng: 109.2435, beachDistance: "Orol sohilida 0m", airportDistance: "35 km (CXR)" },
  'kmp-syx-01': { lat: 18.2961, lng: 109.7397, beachDistance: "Haitang Bay 0m", airportDistance: "42 km (SYX)" },
  'kmp-tbs-01': { lat: 41.6917, lng: 44.8258, beachDistance: "Shahar markazi (Kura daryosi)", airportDistance: "14 km (TBS)" },
  'kmp-gyd-01': { lat: 40.3644, lng: 49.8336, beachDistance: "Kaspiy dengizi bulvari 100m", airportDistance: "25 km (GYD)" }
};

export function getCoordinatesForTour(tour: TourPackage): { lat: number; lng: number; beachDistance?: string; airportDistance?: string } {
  if (tour.lat && tour.lng) {
    return { lat: tour.lat, lng: tour.lng };
  }
  if (DESTINATION_COORDINATES[tour.id]) {
    return DESTINATION_COORDINATES[tour.id];
  }

  // Fallback based on resort/country
  const loc = (tour.location || '').toLowerCase();
  if (loc.includes('belek')) return { lat: 36.8625, lng: 31.0556, beachDistance: "Plyaj 0-100m" };
  if (loc.includes('kemer')) return { lat: 36.6022, lng: 30.5594, beachDistance: "Tog' & Dengiz sohil" };
  if (loc.includes('alanya')) return { lat: 36.5438, lng: 31.9998, beachDistance: "Kleopatra plyaji 150m" };
  if (loc.includes('antalya') || loc.includes('lara')) return { lat: 36.8569, lng: 30.8524, beachDistance: "Lara sohil 50m" };
  if (loc.includes('bodrum')) return { lat: 37.0344, lng: 27.4305, beachDistance: "Egey dengizi 0m" };
  if (loc.includes('istanbul')) return { lat: 41.0082, lng: 28.9784, beachDistance: "Tarixiy markaz" };
  if (loc.includes('dubay') || loc.includes('dubai')) return { lat: 25.1124, lng: 55.1390, beachDistance: "Fors ko'rfazi" };
  if (loc.includes('sharm')) return { lat: 27.9158, lng: 34.3299, beachDistance: "Marjon riflari 0m" };
  if (loc.includes('phuket') || loc.includes('tailand')) return { lat: 7.8954, lng: 98.2974, beachDistance: "Andaman dengizi" };
  if (loc.includes('maldiv')) return { lat: 4.1755, lng: 73.5093, beachDistance: "Hind okeani atolli" };
  
  // Default to Mediterranean / Antalya
  return { lat: 36.8841, lng: 30.7056, beachDistance: "Plyaj yaqinida" };
}

interface SingleTourMapProps {
  tour: TourPackage;
  height?: string;
  className?: string;
}

export const SingleTourMap: React.FC<SingleTourMapProps> = ({ tour, height = '220px', className = '' }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const coords = useMemo(() => getCoordinatesForTour(tour), [tour]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [showInfo, setShowInfo] = useState(false);

  if (!apiKey) {
    return (
      <div
        className={`w-full rounded-2xl border flex flex-col items-center justify-center p-4 text-center ${className}`}
        style={{
          height,
          backgroundColor: 'var(--tw-subtle)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <span className="text-2xl mb-1">🗺️</span>
        <p className="text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>Google Xarita</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--tw-text-sub)' }}>
          {tour.location}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.title + ' ' + tour.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-[10px] font-bold px-3 py-1 rounded-lg border tap-bounce"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-border)',
            color: 'var(--tw-accent)'
          }}
        >
          Google Xaritada ochish ↗
        </a>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border shadow-sm ${className}`}
      style={{ height, borderColor: 'var(--tw-border)' }}
    >
      <APIProvider apiKey={apiKey} libraries={['marker']}>
        <Map
          mapId="bf51a910020fa25a"
          defaultCenter={{ lat: coords.lat, lng: coords.lng }}
          defaultZoom={14}
          mapTypeId={mapType}
          gestureHandling="cooperative"
          disableDefaultUI={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          <AdvancedMarker
            position={{ lat: coords.lat, lng: coords.lng }}
            title={tour.title}
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <Pin
              background="var(--tw-accent, #ff5b00)"
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={1.2}
            />
          </AdvancedMarker>

          {showInfo && (
            <InfoWindow
              position={{ lat: coords.lat, lng: coords.lng }}
              onCloseClick={() => setShowInfo(false)}
            >
              <div className="p-1 max-w-[200px] text-slate-900">
                <h4 className="text-xs font-bold leading-tight line-clamp-1">{tour.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{tour.location}</p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-amber-600">★ {tour.rating}</span>
                  <span className="text-xs font-black text-[#ff5b00]">${tour.price}</span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Top Controls Overlay */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div
            className="pointer-events-auto px-2 py-1 rounded-lg backdrop-blur-md border text-[10px] font-bold shadow-xs flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-main)'
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[150px]">{tour.resort || tour.location}</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapType((t) => (t === 'roadmap' ? 'hybrid' : 'roadmap'))}
              className="px-2 py-1 rounded-lg backdrop-blur-md border text-[10px] font-bold shadow-xs transition tap-bounce"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
              title="Xarita / Sun'iy yo'ldosh ko'rinishi"
            >
              {mapType === 'roadmap' ? '🛰️ Sun\'iy yo\'ldosh' : '🗺️ Standart'}
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-lg backdrop-blur-md border text-[10px] font-bold shadow-xs transition tap-bounce flex items-center gap-1"
              style={{
                backgroundColor: 'var(--tw-accent)',
                borderColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)'
              }}
              title="Google Maps marshrut"
            >
              <span>🧭 Yo'l</span>
            </a>
          </div>
        </div>

        {/* Bottom Distance Bar */}
        {(coords.beachDistance || coords.airportDistance) && (
          <div
            className="absolute bottom-2 left-2 right-2 p-1.5 rounded-xl backdrop-blur-md border text-[9px] shadow-xs flex items-center justify-between"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-sub)'
            }}
          >
            {coords.beachDistance && (
              <span className="flex items-center gap-1 truncate font-medium">
                🏖️ <span style={{ color: 'var(--tw-text-main)' }}>{coords.beachDistance}</span>
              </span>
            )}
            {coords.airportDistance && (
              <span className="flex items-center gap-1 truncate font-medium ml-auto">
                ✈️ <span style={{ color: 'var(--tw-text-main)' }}>{coords.airportDistance}</span>
              </span>
            )}
          </div>
        )}
      </APIProvider>
    </div>
  );
};

interface AllToursInteractiveMapProps {
  tours: TourPackage[];
  selectedCountry?: string;
  onSelectTour: (tour: TourPackage) => void;
  onClose?: () => void;
}

export const AllToursInteractiveMap: React.FC<AllToursInteractiveMapProps> = ({
  tours,
  selectedCountry,
  onSelectTour,
  onClose
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [activeTour, setActiveTour] = useState<TourPackage | null>(tours[0] || null);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filtered tours
  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      if (selectedCountry && selectedCountry !== 'all') {
        const countryMatch = (t.country || '').toLowerCase().includes(selectedCountry.toLowerCase());
        const locMatch = (t.location || '').toLowerCase().includes(selectedCountry.toLowerCase());
        if (!countryMatch && !locMatch) return false;
      }
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [tours, selectedCountry, filterCategory]);

  // Center based on first tour or Antalya/Mediterranean
  const centerCoords = useMemo(() => {
    if (activeTour) {
      return getCoordinatesForTour(activeTour);
    }
    if (filteredTours.length > 0) {
      return getCoordinatesForTour(filteredTours[0]);
    }
    return { lat: 36.8841, lng: 30.7056 };
  }, [activeTour, filteredTours]);

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Header Bar */}
      <div
        className="p-3 border-b flex items-center justify-between z-10 shrink-0"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-sm"
            style={{
              backgroundColor: 'var(--tw-accent-light)',
              borderColor: 'var(--tw-accent)',
              color: 'var(--tw-accent)'
            }}
          >
            🗺️
          </div>
          <div>
            <h3 className="text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>
              Interaktiv Tur Xaritasi
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
              {filteredTours.length} ta mehmonxona va kurortlar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMapType((t) => (t === 'roadmap' ? 'hybrid' : 'roadmap'))}
            className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold tap-bounce transition shadow-xs"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-main)'
            }}
          >
            {mapType === 'roadmap' ? '🛰️ Sputnik' : '🗺️ Xarita'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold tap-bounce transition"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="px-3 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar z-10 shrink-0"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'beach', label: '🏖️ Plyaj' },
          { id: 'luxury', label: '💎 VIP Luxury' },
          { id: 'culture', label: '🕌 Madaniyat' }
        ].map((f) => {
          const isSelected = filterCategory === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterCategory(f.id)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition tap-bounce border"
              style={{
                backgroundColor: isSelected ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                color: isSelected ? 'var(--tw-accent-contrast)' : 'var(--tw-text-sub)',
                borderColor: isSelected ? 'var(--tw-accent)' : 'var(--tw-border)'
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Map View Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        <APIProvider apiKey={apiKey} libraries={['marker']}>
          <Map
            mapId="bf51a910020fa25a"
            defaultCenter={{ lat: centerCoords.lat, lng: centerCoords.lng }}
            defaultZoom={7}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {filteredTours.map((tour) => {
              const pos = getCoordinatesForTour(tour);
              const isSelected = activeTour?.id === tour.id;

              return (
                <AdvancedMarker
                  key={tour.id}
                  position={{ lat: pos.lat, lng: pos.lng }}
                  title={tour.title}
                  onClick={() => setActiveTour(tour)}
                >
                  <Pin
                    background={isSelected ? '#10b981' : 'var(--tw-accent, #ff5b00)'}
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.3 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Selected Tour Floating Card */}
        {activeTour && (
          <div className="absolute bottom-3 left-3 right-3 z-20 animate-slideUp">
            <div
              className="p-3 rounded-2xl border shadow-xl flex items-center gap-3 backdrop-blur-md"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <img
                src={activeTour.img}
                alt={activeTour.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700/30"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-black px-1.5 py-0.2 rounded"
                    style={{
                      backgroundColor: 'var(--tw-accent-light)',
                      color: 'var(--tw-accent)'
                    }}
                  >
                    ★ {activeTour.rating}
                  </span>
                  <span className="text-xs font-black font-mono" style={{ color: 'var(--tw-accent)' }}>
                    ${activeTour.price}
                  </span>
                </div>
                <h4 className="text-xs font-bold truncate mt-0.5" style={{ color: 'var(--tw-text-main)' }}>
                  {activeTour.title}
                </h4>
                <p className="text-[10px] truncate" style={{ color: 'var(--tw-text-sub)' }}>
                  📍 {activeTour.location} • {activeTour.nights}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectTour(activeTour)}
                    className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-extrabold tap-bounce text-center transition"
                    style={{
                      backgroundColor: 'var(--tw-accent)',
                      color: 'var(--tw-accent-contrast)'
                    }}
                  >
                    Batafsil ko'rish
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${getCoordinatesForTour(activeTour).lat},${getCoordinatesForTour(activeTour).lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 px-2 rounded-lg border text-[10px] font-bold tap-bounce"
                    style={{
                      backgroundColor: 'var(--tw-subtle)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-main)'
                    }}
                    title="Google Maps yo'nalish"
                  >
                    🧭 Yo'l
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
