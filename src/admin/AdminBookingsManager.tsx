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
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>📋</span> Mijozlar Buyurtmalari & Vaucherlar ({bookings.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ilovadan tushgan barcha bronlar, to'lovlar va elektron vaucherlar nazorati
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Tezkor filtr:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Barcha Statuslar</option>
            <option value="Jarayonda">Jarayonda (Kutilmoqda)</option>
            <option value="Tasdiqlangan">Tasdiqlangan</option>
            <option value="Vaucher tayyor">Vaucher tayyor</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vaucher ID, sayohatchi ismi yoki tur nomi..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Vaucher / Tur</th>
                <th className="py-3.5">Sayohatchi</th>
                <th className="py-3.5">Marshrut & Muddat</th>
                <th className="py-3.5">Narx (USD)</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.map((b) => {
                const isApproved = b.status === 'Tasdiqlangan';
                const isVoucher = b.status === 'Vaucher tayyor';
                const isPending = b.status === 'Jarayonda';

                return (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        {b.hotelImg ? (
                          <img
                            src={b.hotelImg}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            🏖️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate max-w-[200px]">
                            {b.tourTitle}
                          </p>
                          <span className="font-mono text-cyan-400 text-[11px] font-black">
                            {b.voucherId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-slate-200 text-xs">{b.travelerName}</p>
                      <p className="text-[11px] text-slate-400">{b.flight || "Aviaparvoz kiritilgan"}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="text-xs font-bold text-slate-300">{b.dest}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.dates}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="text-sm font-black text-emerald-400">{b.price}</span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isVoucher
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                        >
                          Batafsil
                        </button>

                        {isPending && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Tasdiqlangan')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-sm"
                            title="Tasdiqlash"
                          >
                            Tasdiqlash
                          </button>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Vaucher tayyor')}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-sm"
                            title="Vaucher chiqarish"
                          >
                            Vaucher
                          </button>
                        )}
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Bron Tafsilotlari
                </span>
                <h3 className="text-base font-black text-white">{selectedBooking.tourTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Vaucher ID:</span>
                <span className="text-xs font-mono font-black text-cyan-400">
                  {selectedBooking.voucherId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Sayohatchi:</span>
                <span className="text-xs font-bold text-white">{selectedBooking.travelerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Yo'nalish:</span>
                <span className="text-xs font-bold text-slate-200">{selectedBooking.dest}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Sana / Muddat:</span>
                <span className="text-xs font-bold text-slate-200">{selectedBooking.dates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Reys & Aviakompaniya:</span>
                <span className="text-xs font-bold text-indigo-300">
                  {selectedBooking.flight || 'Charter reys'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-xs text-slate-400 font-medium">Umumiy to'lov:</span>
                <span className="text-base font-black text-emerald-400">
                  {selectedBooking.price}
                </span>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">
                Buyurtma Statusini Yangilash:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Jarayonda')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Jarayonda'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  ⏳ Jarayonda
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Tasdiqlangan')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Tasdiqlangan'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  ✅ Tasdiqlangan
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Vaucher tayyor')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Vaucher tayyor'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  🎟️ Vaucher tayyor
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCancel(selectedBooking.id, selectedBooking.tourTitle)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Bronni bekor qilish</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
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
