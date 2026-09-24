import React, { useState } from 'react';
import { Booking, TourPackage } from '../types';

interface TripsScreenProps {
  bookings: Booking[];
  savedTours: TourPackage[];
  onOpenTourModal: (tour: TourPackage) => void;
  onDownloadVoucher: (voucherId: string, booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onRemoveSaved: (tourId: string) => void;
  onNavigateToSearch: () => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({
  bookings,
  savedTours,
  onOpenTourModal,
  onDownloadVoucher,
  onCancelBooking,
  onRemoveSaved,
  onNavigateToSearch
}) => {
  const [subTab, setSubTab] = useState<'active' | 'saved'>('active');

  const activeBookings = bookings.filter((b) => b.type === 'active');

  return (
    <div className="space-y-3.5 pb-24 select-none">
      {/* Trips Subheader Navigation Tabs */}
      <div
        className="flex items-center p-1 rounded-2xl border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <button
          id="ttab-active"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 tap-bounce ${
            subTab === 'active' ? 'shadow-xs' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: subTab === 'active' ? 'var(--tw-accent)' : 'transparent',
            color: subTab === 'active' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-sub)'
          }}
          onClick={() => setSubTab('active')}
          type="button"
        >
          <span>📋</span>
          <span>Buyurtmalar & Turlar ({activeBookings.length})</span>
        </button>

        <button
          id="ttab-saved"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 tap-bounce ${
            subTab === 'saved' ? 'shadow-xs' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: subTab === 'saved' ? 'var(--tw-accent)' : 'transparent',
            color: subTab === 'saved' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-sub)'
          }}
          onClick={() => setSubTab('saved')}
          type="button"
        >
          <span>❤️</span>
          <span>Saqlanganlar ({savedTours.length})</span>
        </button>
      </div>

      {/* ACTIVE BOOKINGS LIST VIEW */}
      {subTab === 'active' && (
        <div className="space-y-3" id="trips-list-container">
          {activeBookings.length === 0 ? (
            <div
              className="text-center py-12 space-y-2 rounded-2xl border p-6 transition-colors"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <span className="text-4xl">🧳</span>
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--tw-text-main)' }}
              >
                Sizda hozircha faol buyurtmalar yo'q
              </p>
              <button
                className="text-xs font-bold underline pt-1 block mx-auto tap-bounce"
                style={{ color: 'var(--tw-accent)' }}
                onClick={onNavigateToSearch}
                type="button"
              >
                TravelWay turpaketlarini qidirish
              </button>
            </div>
          ) : (
            activeBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl p-3.5 space-y-3 border transition-colors shadow-sm"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)',
                  boxShadow: 'var(--tw-card-shadow)'
                }}
              >
                <div
                  className="flex items-center justify-between pb-2 border-b"
                  style={{ borderColor: 'var(--tw-border)' }}
                >
                  <div>
                    <span
                      className="text-[9px] font-mono"
                      style={{ color: 'var(--tw-text-sub)' }}
                    >
                      ID: {b.voucherId}
                    </span>
                    <h4
                      className="text-xs font-bold"
                      style={{ color: 'var(--tw-text-main)' }}
                    >
                      {b.tourTitle}
                    </h4>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: 'var(--tw-accent-light)',
                      color: 'var(--tw-accent)',
                      borderColor: 'var(--tw-accent-border)'
                    }}
                  >
                    ✓ {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span
                      className="text-[9px] block"
                      style={{ color: 'var(--tw-text-sub)' }}
                    >
                      Yo'nalish:
                    </span>
                    <span
                      className="font-semibold truncate block"
                      style={{ color: 'var(--tw-text-main)' }}
                    >
                      📍 {b.dest}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-[9px] block"
                      style={{ color: 'var(--tw-text-sub)' }}
                    >
                      Sanalar:
                    </span>
                    <span
                      className="font-semibold block"
                      style={{ color: 'var(--tw-text-main)' }}
                    >
                      📅 {b.dates}
                    </span>
                  </div>
                </div>

                {b.flight && (
                  <div
                    className="p-2 rounded-xl text-[10px] flex items-center justify-between border transition-colors"
                    style={{
                      backgroundColor: 'var(--tw-subtle)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-sub)'
                    }}
                  >
                    <span className="truncate">✈️ {b.flight}</span>
                    <span
                      className="font-bold shrink-0"
                      style={{ color: 'var(--tw-accent)' }}
                    >
                      {b.nightsCount || 7} kecha
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span
                    className="text-xs font-bold"
                    style={{ color: 'var(--tw-accent)' }}
                  >
                    {b.price}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg tap-bounce flex items-center gap-1 border transition-colors"
                      style={{
                        backgroundColor: 'var(--tw-subtle)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-main)'
                      }}
                      onClick={() => onDownloadVoucher(b.voucherId, b)}
                      type="button"
                    >
                      📥 Vaucher
                    </button>
                    <button
                      className="px-2 py-1.5 text-rose-500 hover:text-rose-600 text-[11px] font-medium tap-bounce"
                      onClick={() => onCancelBooking(b.id)}
                      type="button"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. SAVED TOURS VIEW */}
      {subTab === 'saved' && (
        <div className="space-y-3">
          {savedTours.length === 0 ? (
            <div
              className="text-center py-12 space-y-2 rounded-2xl border p-6 transition-colors"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <span className="text-4xl">❤️</span>
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                Hech qanday turpaket saqlanmagan
              </p>
              <button
                type="button"
                onClick={onNavigateToSearch}
                className="text-xs font-bold underline pt-1 block mx-auto tap-bounce"
                style={{ color: 'var(--tw-accent)' }}
              >
                Turpaketlarni kashf etish
              </button>
            </div>
          ) : (
            savedTours.map((tour) => (
              <div
                key={tour.id}
                className="rounded-2xl p-3 flex items-center justify-between gap-3 border transition-colors shadow-sm"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)',
                  boxShadow: 'var(--tw-card-shadow)'
                }}
              >
                <img src={tour.img} className="w-14 h-14 rounded-xl object-cover" alt={tour.title} />
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-xs font-bold truncate"
                    style={{ color: 'var(--tw-text-main)' }}
                  >
                    {tour.title}
                  </h4>
                  <p
                    className="text-[10px]"
                    style={{ color: 'var(--tw-text-sub)' }}
                  >
                    📍 {tour.location}
                  </p>
                  <p
                    className="text-xs font-black mt-0.5"
                    style={{ color: 'var(--tw-accent)' }}
                  >
                    ${tour.price}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg tap-bounce transition shadow-xs"
                    style={{
                      backgroundColor: 'var(--tw-accent)',
                      color: 'var(--tw-accent-contrast)'
                    }}
                    onClick={() => onOpenTourModal(tour)}
                    type="button"
                  >
                    Ko'rish
                  </button>
                  <button
                    className="text-[10px] text-rose-500 hover:text-rose-600 text-center py-0.5 tap-bounce"
                    onClick={() => onRemoveSaved(tour.id)}
                    type="button"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
