import React, { useState } from 'react';
import { Booking } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminBookingsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onCancelBooking: (bookingId: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminBookingsManager: React.FC<AdminBookingsManagerProps> = ({
  currentRole,
  currentAdmin,
  bookings,
  onUpdateBookingStatus,
  onCancelBooking,
  onShowToast
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.tourTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.travelerName.toLowerCase().includes(search.toLowerCase()) ||
      b.voucherId.toLowerCase().includes(search.toLowerCase()) ||
      b.dest.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    onUpdateBookingStatus(bookingId, newStatus);
    onShowToast(`Buyurtma holati "${newStatus}" ga o'zgartirildi!`, 'success');
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const handleCancel = (bookingId: string, title: string) => {
    if (confirm(`"${title}" buyurtmasini bekor qilishni xohlaysizmi?`)) {
      onCancelBooking(bookingId);
      onShowToast(`Buyurtma bekor qilindi`, 'info');
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11142d] dark:text-white flex items-center gap-2">
            <span>📋</span> Mijozlar Buyurtmalari & Vaucherlar ({bookings.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Ilovadan tushgan barcha bronlar, to'lovlar va elektron vaucherlar nazorati
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-bold">Tezkor filtr:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#e5eaef] dark:border-white/10 focus:outline-none focus:border-[#0891b2]"
          >
            <option value="ALL">Barcha Statuslar</option>
            <option value="Jarayonda">Jarayonda (Kutilmoqda)</option>
            <option value="Tasdiqlangan">Tasdiqlangan</option>
            <option value="Vaucher tayyor">Vaucher tayyor</option>
          </select>
        </div>
      </div>

      {/* Search Input Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777e89] dark:text-[#726c7f] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vaucher ID, sayohatchi ismi yoki tur nomi..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#726c7f] pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-[10px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Vaucher / Tur</th>
                <th className="py-3.5 px-3">Sayohatchi</th>
                <th className="py-3.5 px-3">Marshrut & Muddat</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f9] dark:divide-white/5 text-[#2a3547] dark:text-[#faf9fb]">
              {filteredBookings.map((b) => {
                const isApproved = b.status === 'Tasdiqlangan';
                const isVoucher = b.status === 'Vaucher tayyor';
                const isPending = b.status === 'Jarayonda';

                return (
                  <tr key={b.id} className="hover:bg-[#f8f9fa] dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        {b.hotelImg ? (
                          <img
                            src={b.hotelImg}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover border border-[#e5eaef] dark:border-white/10 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#e0f7fa] dark:bg-cyan-950/40 text-[#0891b2] flex items-center justify-center shrink-0">
                            🏖️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[#11142d] dark:text-white text-xs truncate max-w-[200px]">
                            {b.tourTitle}
                          </p>
                          <span className="font-mono text-[#0891b2] dark:text-cyan-400 text-[11px] font-black">
                            {b.voucherId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-[#11142d] dark:text-white text-xs">{b.travelerName}</p>
                      <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{b.flight || "Aviaparvoz kiritilgan"}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-bold text-[#11142d] dark:text-white">{b.dest}</p>
                      <p className="text-[10px] text-[#777e89] dark:text-[#a39db0] mt-0.5">{b.dates}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-sm font-black text-[#0891b2] dark:text-cyan-400">{b.price}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Tasdiqlangan
                        </span>
                      ) : isVoucher ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0891b2] dark:text-cyan-300 bg-[#e0f7fa] dark:bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-[#b2ebf2] dark:border-cyan-800/40">
                          🎟️ Vaucher tayyor
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Kutilmoqda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40">
                          Bekor qilindi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-black text-xs transition-all shadow-xs tap-bounce"
                      >
                        Boshqarish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eaef] dark:border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0891b2] dark:text-cyan-400 tracking-wider">
                  Bron Tafsilotlari
                </span>
                <h3 className="text-base font-black text-[#11142d] dark:text-white">{selectedBooking.tourTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-[#f4f6f9] dark:bg-white/10 text-[#777e89] hover:text-[#11142d] dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafbfb] dark:bg-white/5 border border-[#e5eaef] dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-medium">Vaucher ID:</span>
                <span className="text-xs font-mono font-black text-[#0891b2] dark:text-cyan-400">
                  {selectedBooking.voucherId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-medium">Sayohatchi:</span>
                <span className="text-xs font-bold text-[#11142d] dark:text-white">{selectedBooking.travelerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-medium">Yo'nalish:</span>
                <span className="text-xs font-bold text-[#2a3547] dark:text-[#faf9fb]">{selectedBooking.dest}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-medium">Sana / Muddat:</span>
                <span className="text-xs font-bold text-[#2a3547] dark:text-[#faf9fb]">{selectedBooking.dates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-medium">Reys & Aviakompaniya:</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedBooking.flight || 'Charter reys'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#e5eaef] dark:border-white/10">
                <span className="text-xs text-[#777e89] dark:text-[#a39db0] font-medium">Umumiy to'lov:</span>
                <span className="text-base font-black text-[#0891b2] dark:text-cyan-400">
                  {selectedBooking.price}
                </span>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div>
              <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-2">
                Buyurtma Statusini Yangilash:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Jarayonda')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Jarayonda'
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300'
                      : 'bg-[#f4f6f9] dark:bg-white/5 text-[#777e89] dark:text-[#a39db0] border-[#e5eaef] dark:border-white/10 hover:text-[#11142d]'
                  }`}
                >
                  ⏳ Jarayonda
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Tasdiqlangan')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Tasdiqlangan'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      : 'bg-[#f4f6f9] dark:bg-white/5 text-[#777e89] dark:text-[#a39db0] border-[#e5eaef] dark:border-white/10 hover:text-[#11142d]'
                  }`}
                >
                  ✅ Tasdiqlangan
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Vaucher tayyor')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Vaucher tayyor'
                      ? 'bg-[#e0f7fa] dark:bg-cyan-950/50 text-[#0891b2] dark:text-cyan-300 border-[#b2ebf2]'
                      : 'bg-[#f4f6f9] dark:bg-white/5 text-[#777e89] dark:text-[#a39db0] border-[#e5eaef] dark:border-white/10 hover:text-[#11142d]'
                  }`}
                >
                  🎟️ Vaucher tayyor
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5eaef] dark:border-white/10">
              <button
                type="button"
                onClick={() => handleCancel(selectedBooking.id, selectedBooking.tourTitle)}
                className="text-xs font-bold text-rose-600 hover:text-rose-500 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Bronni bekor qilish</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e5eaef] text-[#2a3547] dark:text-white text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
